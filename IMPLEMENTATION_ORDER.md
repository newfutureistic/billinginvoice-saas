# ToolForge — Implementation Order

> **Design document (no implementation).** The build sequence for the backend defined
> across `DATABASE_ARCHITECTURE.md`, `PRISMA_SCHEMA_PLAN.md`, `API_ARCHITECTURE.md`,
> `AUTH_FLOW.md`, `RBAC.md`, `STORAGE_PLAN.md`.
> **Frontend is frozen.** Every phase integrates by swapping a `lib/*-data.ts` mock
> import for a real fetch/Server Action returning the **same shape** — no component,
> route, layout, or token is touched. Each phase ends shippable.

---

## Sequencing principle

Build **inside-out**: foundation → identity → tenancy/authz → the polymorphic core →
the flagship tool → everything else. Each phase depends only on those before it, so the
critical path is short and every phase leaves `main` deployable.

```
P0 Foundation
   └─ P1 Auth & Identity
        └─ P2 Tenancy, RBAC & Onboarding
             └─ P3 Tool Registry & Document Core
                  └─ P4 Invoice Engine (flagship)   ← first end-to-end user value
                       ├─ P5 Files, PDF & Storage
                       ├─ P6 Clients & Products
                       ├─ P7 Payments & Billing
                       ├─ P8 Email & Notifications
                       └─ P9 Audit, Activity & Analytics
                            └─ P10 Tool Expansion (quote, receipt, salary slip, PO, calculators)
```

---

## Phase 0 — Foundation

**Goal:** the skeleton every layer plugs into.
- Add deps: `prisma`, `@prisma/client`, `zod`, `@hookform/resolvers`, `@supabase/*`,
  `next-auth@5`, `argon2`. (Respect frozen `package.json` — additive only.)
- `server/config/env.ts` — Zod-validated env (`DATABASE_URL`, `DIRECT_URL`, auth secret,
  provider keys). Supabase pooled + direct URLs (`PRISMA_SCHEMA_PLAN.md §1`).
- Prisma singleton (`server/db/prisma.ts`); base `AppError` + error map; response
  envelope + `RequestContext` types; `compose()` middleware harness.
- Scaffold empty `repositories/`, `services/`, `tools/`, `adapters/` per
  `API_ARCHITECTURE.md §2`.

**Exit:** `prisma generate` runs; app boots; one health route returns the envelope.
**Frozen UI touched:** none.

---

## Phase 1 — Auth & Identity

**Goal:** real login behind the 6 frozen auth pages.
- Prisma models: `User`, `Account`, `Session`, `VerificationToken`, `TwoFactorSecret`,
  `BackupCode`; first migration (`AUTH_FLOW.md`, `PRISMA_SCHEMA_PLAN.md §4`).
- Auth.js v5 + Prisma adapter; Credentials + Google + GitHub; argon2id.
- Flows: sign-up + email verify, sign-in, forgot/reset, 2FA (TOTP + backup codes),
  logout, session + "remember me".
- `lib/validation/auth.schema.ts` (shared with the frozen RHF forms).
- Edge `middleware.ts` protecting `/dashboard`, `/invoice`, `/onboarding`.

**Integrates:** `/auth/*` forms POST to Server Actions; `lib/auth-data.ts` text stays.
**Exit:** a user can sign up, verify, enable 2FA, sign in/out for real.

---

## Phase 2 — Tenancy, RBAC & Onboarding

**Goal:** workspaces, seats, roles, and the onboarding gate.
- Models: `Workspace`, `WorkspaceSettings`, `Membership`, `Invitation`, `Plan`,
  `Subscription`; seed `Plan` rows from frozen pricing.
- `withTenant` + `withRbac` middleware; role→permission map + `authorize()`
  (`RBAC.md §4–5`); `TenantRepository` base (`API_ARCHITECTURE.md §3`).
- Workspace CRUD, member invite/accept/role-change (last-owner guard), workspace
  switching.
- Onboarding persists into `WorkspaceSettings`; `onboardedAt` gate (`AUTH_FLOW.md §9`).

**Integrates:** `WorkspaceSwitcher`, team page (`mockTeamMembers` → API), onboarding
steps, settings General tab.
**Exit:** multi-workspace with enforced roles; onboarding writes real settings.

---

## Phase 3 — Tool Registry & Document Core

**Goal:** the extensibility spine — before any single tool is "special."
- Models: `ToolCategory`, `Tool`, `WorkspaceToolPin`, `ToolRun`; `Document`,
  `DocumentItem`, `DocumentSequence`, `DocumentShare`, `TemplateAsset`.
- Seed categories/tools from `lib/site-data.ts`; seed 8 templates from
  `lib/invoice-templates.ts`.
- `ToolHandler` interface + `registry.ts`; `numbering.service` (row-locked),
  `totals.service` (port of frozen `calculateInvoiceTotals`), base `document.service`.
- Generic `tool.service` dispatch (`API_ARCHITECTURE.md §5`).

**Integrates:** public `/tools`, `/tools/[slug]`, `/tools/category/[category]`
(`site-data` → `Tool` table) — read-only, safe.
**Exit:** tools are data; the document engine exists; a document can be created
generically.

---

## Phase 4 — Invoice Engine (flagship) 🎯

**Goal:** first full end-to-end value — create/edit/list/view/send an invoice.
- `invoice.service` (create/update/status transitions); `document.repository` filters
  matching frozen list params (`status/sort/order`).
- `lib/validation/invoice.schema.ts` + `server/tools/invoice/` (schema, handler).
- Endpoints: documents CRUD, autosave `PATCH`, list, detail.

**Integrates:**
- `/invoice/new` builder → Server Action save/autosave (undo/redo stays client-side).
- `/dashboard/invoices` + `[id]` → API (`mockInvoices` → real).
- Dashboard KPI cards → aggregate queries (`mockKPIs` → real).
**Exit:** invoices persist per workspace, numbered, totaled server-side, listed and
viewed through the untouched UI.

---

## Phase 5 — Files, PDF & Storage

**Goal:** logos, avatars, and PDF export.
- `FileObject` model; Supabase buckets (`STORAGE_PLAN.md §2`); storage adapter.
- Signed upload/commit flow; per-plan quota checks.
- PDF export pipeline via `toPdf()`; QR generation for invoices.

**Integrates:** onboarding/branding logo upload, invoice branding step, step-10
"Export", `/invoice/preview`, profile avatar. **Exit:** real logo upload + downloadable
branded invoice PDF.

---

## Phase 6 — Clients & Products

**Goal:** reusable CRM/catalogue behind documents.
- `Client`, `Product` models + repositories/services; link into document create
  (snapshot-on-use).
**Integrates:** `/dashboard/clients` (+`[id]`), `/dashboard/products`
(`mockClients`/`mockProducts` → API); client detail activity/invoices.
**Exit:** clients/products managed and selectable in the builder.

---

## Phase 7 — Payments & Billing

**Goal:** record payments; monetize plans.
- `Payment`, `PaymentAllocation`; `payment.service`; manual + gateway (Stripe/Razorpay)
  adapters; idempotent webhooks (`API_ARCHITECTURE.md §10`).
- `billing.service`: plan upgrades, `docsPerMonth`/`seats` enforcement
  (`RBAC.md §7`), subscription webhooks.
**Integrates:** pricing page checkout, settings Billing tab, invoice "mark paid" →
status/`amountPaid`; KPI revenue reflects real payments.
**Exit:** invoices settle; plan limits enforced; upgrades work.

---

## Phase 8 — Email & Notifications

**Goal:** transactional comms + in-app feed.
- Email adapter (Resend) + `EmailMessage`; templates per `EmailKind`.
- `Notification` model + `notification.service` fan-out; optional Supabase Realtime.
- Wire auth emails (verify/reset/invite), invoice send, reminders.
**Integrates:** topbar bell + `/dashboard/notifications` (`mockNotifications` → API);
invoice send emails a branded PDF. **Exit:** users receive email + in-app notifications.

---

## Phase 9 — Audit, Activity & Analytics

**Goal:** history and insight.
- `AuditLog` (immutable) + `ActivityEvent`; service interceptor emitting both on state
  changes (retro-wire Phases 4–8).
- Analytics aggregation queries (revenue-over-time, invoice/client stats).
**Integrates:** activity feeds on dashboard + entity detail pages (`mockActivityLogs`
→ real); `/dashboard/analytics` charts (`mockRevenueData` → aggregates); audit UI gated
to Business plan. **Exit:** every action traceable; analytics show real data.

---

## Phase 10 — Tool Expansion (proves "no redesign")

**Goal:** add more tools using only the registry seam — **zero core changes**.
- **Document tools** (each = folder in `server/tools/<slug>/` + Zod schema + `toPdf` +
  seed row + `DocumentType` enum value): **Quotation** (+ convert-to-invoice),
  **Receipt**, **Credit Note**, **Salary Slip**, **Purchase Order**.
- **Calculator/utility tools** (each = folder + Zod schema + `run()`, routed through the
  generic `/api/tools/[slug]/run`): **GST Calculator**, **EMI Calculator**,
  **Loan Calculator**, **Number To Words**, **QR Generator**, **Barcode Generator**.
- **Async tools:** Recurring Billing + Payment Reminders jobs (`API_ARCHITECTURE.md §13`).

**Integrates:** each tool's frozen `/tools/[slug]` page + builder UI, no new backend
architecture. **Exit:** the mission's full tool list live; adding tool #100 is the same
recipe. **This phase is the acceptance test for the whole design.**

---

## Cross-cutting (every phase)

- **Testing:** unit (services/totals/numbering), integration (repos vs a Supabase test
  branch), e2e on critical flows (auth, invoice create→send→pay). Tenant-isolation test
  in every repo suite.
- **Migrations:** expand→migrate→contract; shadow-DB drift gate in CI
  (`PRISMA_SCHEMA_PLAN.md §9`).
- **Observability:** structured logs (request/workspace/actor ids), error boundaries,
  audit stream.
- **Security:** re-validate on server; rate limits; secrets in env only; RLS as opt-in
  hardening.
- **Frozen-UI guard:** each PR diff must show **zero** changes under `app/(site|auth|
  onboarding|invoice|dashboard|design-system)` components, tokens, or routes — only
  data-source swaps and new `server/`, `app/api/`, `lib/validation` files.

---

## Dependency matrix

| Phase | Hard deps | Unlocks |
|-------|-----------|---------|
| P0 | — | all |
| P1 | P0 | P2 |
| P2 | P1 | P3, gating everywhere |
| P3 | P2 | P4, P10 |
| P4 | P3 | P5–P9 |
| P5 | P4 | PDF/email attachments |
| P6 | P3 | richer invoices |
| P7 | P4 | revenue analytics |
| P8 | P4 (P5 for attachments) | reminders |
| P9 | P4–P8 | analytics/audit UI |
| P10 | P3–P9 | full catalogue |

---

## Definition of done (Mission 1)

- All 7 design docs approved and internally consistent. ✅ (this deliverable)
- Schema covers every frozen type + every mission tool with **no per-tool models**.
- A documented path exists to add any of the 100+ future tools via the registry seam
  **without a backend redesign**.
- Frontend remains byte-for-byte frozen; integration is data-source substitution only.

**STOP — awaiting next instruction.**
