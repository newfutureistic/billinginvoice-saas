# ToolForge — File Storage Strategy

> **Design document (no implementation).** File storage on **Supabase Storage**
> (S3-compatible), fronted by the `FileObject` metadata model and the storage adapter.
> Grounded in frozen features: logo upload (onboarding `/branding`, invoice branding
> `logoUrl`), one-click **PDF export** (invoice builder step 10, `/invoice/preview`),
> **QR code** on invoices (`InvoiceData.qrCode`), avatars, and the QR/Barcode generator
> tools. No UI changes — these wire behind existing buttons/fields.

---

## 1. Principles

1. **Storage holds bytes; Postgres holds truth.** Every stored object has a
   `FileObject` row (owner, kind, bucket, path, mime, size, checksum). The app never
   trusts a raw storage path — it resolves through `FileObject` (tenant-checked).
2. **Tenant-scoped keys.** Every object key begins with `workspaceId/`, so isolation is
   visible in the path and enforceable by policy.
3. **Private by default.** Only genuinely public assets live in a public bucket; the
   rest are served via short-lived **signed URLs**.
4. **Direct-to-storage uploads.** Large files (logos, attachments) upload straight to
   Supabase via a signed URL — bytes never pass through our API compute.
5. **Provider-agnostic adapter.** `server/adapters/storage.ts` wraps Supabase behind
   `getUploadUrl / getSignedUrl / put / delete / move`; swapping to S3/R2 is an adapter
   change, not an app change.

---

## 2. Buckets

| Bucket | Visibility | Contents | Key pattern |
|--------|-----------|----------|-------------|
| `public-assets` | **public** | Marketing/system template thumbnails, static tool icons. | `system/…` |
| `workspace-logos` | private (signed) | Business logos (onboarding + invoice branding). | `{workspaceId}/logo/{fileId}.{ext}` |
| `avatars` | private (signed) | User profile avatars. | `{userId}/avatar/{fileId}.{ext}` |
| `documents` | **private** | Generated PDFs (invoices, quotes, receipts, salary slips, POs). | `{workspaceId}/{docType}/{documentId}/{fileId}.pdf` |
| `generated` | private (signed) | QR codes, barcodes, calculator result images. | `{workspaceId}/generated/{fileId}.{png\|svg}` |
| `attachments` | **private** | User uploads attached to documents/tool runs (e.g. receipts for Expense Tracker, PDFs for PDF tools). | `{workspaceId}/attachments/{fileId}.{ext}` |
| `exports` | private (signed) | Bulk exports (CSV/PDF from Financial Report, Timesheet). | `{workspaceId}/exports/{fileId}.{ext}` |

Bucket ⇄ `FileKind` enum (`LOGO`, `AVATAR`, `DOCUMENT_PDF`, `INVOICE_PDF`, `QR`,
`BARCODE`, `ATTACHMENT`, `EXPORT`) keeps metadata consistent with physical location.

---

## 3. Upload flow (direct-to-storage, signed)

Used by the frozen logo/avatar/attachment upload controls.

```
Client picks a file
  → POST /api/files/sign  { kind, mime, size }
      ├─ withAuth + withTenant + withRbac
      ├─ validate mime allow-list + size cap (per kind & plan)   → 422 if bad
      ├─ create FileObject (status=pending) with tenant-scoped path
      └─ return { signedUploadUrl, fileId, path }
  → Client PUTs bytes directly to Supabase Storage (progress bar, no API compute)
  → POST /api/files/:id/commit
      ├─ verify object exists, size/mime/checksum match the signed request
      ├─ mark FileObject committed
      └─ (logo) set WorkspaceSettings.logoFileId · (avatar) User.image
```
- **Validation:** server-side mime allow-list (`image/png|jpeg|svg+xml|webp`, `application/pdf`),
  magic-byte sniffing (don't trust extension), max size per kind (e.g. logo ≤ 2 MB),
  and **per-plan quota** checks.
- **Orphans:** `pending` FileObjects with no commit are GC'd by the cleanup job (§8).

---

## 4. Serving files (access control)

- **Public bucket** → direct CDN URL (system template thumbnails, tool icons only).
- **Private buckets** → **short-lived signed URLs** (default TTL 60–300s) minted by
  `GET /api/files/:id/url`, which first checks: file's `workspaceId == ctx.workspace`
  and the caller's `document:export`/read permission. **Authorization happens in our
  service before a signed URL is ever issued** — the path's `workspaceId` prefix is
  defence-in-depth, not the primary gate.
- Signed URLs are never stored; regenerated on demand so revoking access is immediate.
- Optional hardening: Supabase Storage **RLS** policies keyed on the `{workspaceId}/`
  path prefix, mirroring the DB tenant boundary (`DATABASE_ARCHITECTURE.md §13`).

---

## 5. PDF generation & storage (invoice export engine)

Powers frozen invoice step 10 "Preview & Export" and `/invoice/preview`, and every
future document tool.

```
POST /api/documents/:id/pdf
  → InvoiceService.exportPdf()
      ├─ load Document (+items, snapshots, branding, template)
      ├─ render via tool handler's toPdf()  (React-PDF / server-side renderer)
      │     — colors from TemplateAsset + WorkspaceSettings.brandColor (frozen tokens)
      │     — embed logo (signed fetch) + QR (see §6)
      ├─ store in `documents` bucket → create FileObject(kind=DOCUMENT_PDF)
      ├─ set Document.pdfFileId
      └─ return signed URL  (download / preview)
```
- **Deterministic + cacheable:** the stored PDF is reused until the document changes
  (`updatedAt` bump invalidates → regenerate). Sending an invoice attaches this exact
  file to the `INVOICE_SENT` email.
- **Every document tool** reuses this pipeline via its `toPdf()` handler — one export
  engine, N tools.

---

## 6. QR & barcode generation

Two uses: (a) the QR on an invoice (`InvoiceData.qrCode`), (b) the standalone
**QR Generator** / **Barcode Generator** tools.

```
Tool run (kind=GENERATOR)
  → generate image (server-side lib) → store in `generated` bucket
  → FileObject(kind=QR|BARCODE) → resultFileId on ToolRun / referenced by Document
```
- QR content for invoices = payment link or document share URL (`DocumentShare` token).
- Formats: PNG + SVG; cached and reused (content-hash key) so identical inputs don't
  regenerate.

---

## 7. Quotas & limits (per plan)

Tie storage to the frozen plan model (`RBAC.md §7`):

| | Free | Pro | Business |
|--|------|-----|----------|
| Total storage | 100 MB | 5 GB | 50 GB |
| Max file size | 2 MB | 10 MB | 25 MB |
| Attachments | ✖ | ✔ | ✔ |

Enforced in `/api/files/sign` before issuing an upload URL (`PlanLimitError` → frozen
upgrade prompt). Usage tracked by summing `FileObject.sizeBytes` per workspace.

---

## 8. Lifecycle & cleanup

- **Orphan GC** (`jobs/cleanup`): delete `pending` uncommitted FileObjects > 24h old
  and their storage objects.
- **Cascade:** deleting a workspace (post grace period) removes its objects by
  `{workspaceId}/` prefix; deleting a document nulls `pdfFileId` and schedules its PDF
  for removal (kept briefly for audit).
- **Regeneration replaces, not appends:** re-exporting a PDF or re-uploading a logo
  supersedes the old FileObject; the previous storage object is deleted after the row
  is repointed.
- **Retention:** exports auto-expire per plan; document PDFs retained with the document.
- **Backups:** rely on Supabase Storage durability + periodic bucket backup for
  `documents`/`attachments` (business-critical).

---

## 9. Security summary

- Private-by-default buckets; time-boxed signed URLs; authorization in the service
  before any URL is minted.
- Tenant-prefixed keys + (optional) Storage RLS = isolation in depth.
- Mime allow-list + magic-byte sniff + size caps; SVGs sanitized to strip scripts.
- No secrets/PII in object keys; every object traceable to a `FileObject` owner + audit.

---

## 10. Coverage check

| Mission topic | Section |
|---|---|
| File Storage Strategy | §1–§4, §7–§9 |
| Invoice Engine (PDF/export) | §5 |
| QR / Barcode generators | §6 |

**Related:** `DATABASE_ARCHITECTURE.md` (`FileObject`), `API_ARCHITECTURE.md §2/§9`
(adapters, export service), `RBAC.md §7` (plan quotas).
