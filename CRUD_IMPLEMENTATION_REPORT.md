# ToolForge — Business CRUD Engine Implementation Report

> **Mission 5 — Enterprise Business CRUD Engine.** Status: **complete & green.**
> Backend only. The permanently-frozen frontend is **untouched** — no UI, JSX, CSS,
> Tailwind, design tokens, components, routes, or layouts changed. Every change is
> additive under `server/`, `lib/`, and `app/api/v1/`, reusing the Mission 2–4 foundation
> (repositories, services, DTOs, validation, middleware, RBAC, error system, API wrapper).
> No architecture was duplicated.

---

## Results

| Check | Result |
|-------|--------|
| `npm run typecheck` (`tsc --noEmit`) | **0 errors** |
| `npm run build` (`next build`) | **exit 0** — 57 frozen routes + all business CRUD API routes + edge Proxy |
| `npm run test` (node:test + tsx) | **82/82 pass** (70 prior + **12 new**) |

Baseline (post-Mission-4) was 0 / exit 0 / 70-pass; it stays green with the CRUD engine on top.

---

## Reuse, not reinvention

Everything is built on the existing seams — nothing was re-implemented:

- **API wrapper** — every endpoint is a thin `defineRoute({...})`; the auth → workspace →
  membership → permission → validation chain from Mission 4 is applied via config flags.
- **RBAC** — routes declare `permission: 'client:read'` etc.; ownership (`:own`) for
  MEMBERs is enforced in the document service via `requireOwnership` (404-hides existence).
- **Repositories** — extend `TenantRepository` (auto workspace scoping + soft-delete).
- **Validation** — reuses `lib/validation/*` (the generic document schema reuses the frozen
  invoice sub-schemas — no duplicated rules).
- **DTOs / error system / tenant middleware** — reused verbatim.

The one deliberate *base-class enhancement* (not duplication): `TenantCrudService` gained
audit logging + activity-timeline emission on every mutation, allow-listed sorting, and the
soft-delete recycle-bin lifecycle (soft delete → restore → permanent delete + deleted
listing). The concrete Client/Product services are ~60 lines each on top of it.

---

## What was built (mapped to the mission)

### 1 · Workspace CRUD
`WorkspaceService` + routes `GET/POST /api/v1/workspaces` (list mine / create-as-OWNER,
atomic workspace+settings+membership+FREE-subscription) and `GET/PATCH/DELETE
/api/v1/workspace` (active-workspace detail/update/soft-delete, gated by
`workspace:read/update/delete`).

### 2 · Clients — full CRUD + search + pagination + filtering + soft delete + restore
`ClientService extends TenantCrudService`. Routes: `clients` (list+create),
`clients/[id]` (get/update/delete — `?permanent=true` for hard delete),
`clients/[id]/restore`, `clients/deleted` (recycle bin). Search + status filter + sort.

### 3 · Products — CRUD + categories + search + pagination + soft delete + restore
`ProductService extends TenantCrudService`. Same route shape as clients plus
`products/categories` (distinct categories). SKU + name search.

### 4 · Invoice Templates — CRUD + default + duplicate + preview
`TemplateService` (system presets read-only, workspace templates editable). Routes:
`templates` (list+create), `templates/[id]` (get/update/delete),
`templates/[id]/duplicate`, `templates/[id]/default` (writes `WorkspaceSettings.defaultTemplateId`),
`templates/[id]/preview` (preview metadata).

### 5 · Documents — one generic engine, driven by `DocumentType`
`DocumentService` handles **invoice, quote/estimate, receipt, purchase order, credit note,
salary slip, proposal, delivery note** with *no per-type duplication*. Per create it:
computes totals (shared `computeDocumentTotals` engine, reusing the tax util), allocates a
**gap-free number** via `DocumentSequence` inside a transaction, and persists the document
+ line items **atomically**. Ownership (`:own`) enforced for MEMBERs. Routes: `documents`
(list+create, `?type=`), `documents/[id]` (get/update/delete), `documents/[id]/status`
(send → SENT, mark paid → PAID …), `documents/[id]/restore`, `documents/deleted`.

### 6 · Dashboard — every mock source replaced by Prisma
`DashboardService` + `DashboardRepository` compose KPIs (with month-over-month change),
the revenue + invoice monthly series, invoice status breakdown, recent documents, and the
recent activity feed from a handful of parallel, tenant-scoped aggregations
(`count` / `aggregate` / `groupBy` / one bounded window) — **no N+1, no mock data**. DTO
shapes mirror the frozen `lib/dashboard-data.ts` types (minus the UI-only icon), so they
are drop-in. Route: `GET /api/v1/dashboard`.

### 7 · Global search
`SearchService` — workspace-scoped fan-out across clients, products, documents and
templates, normalized to one card shape, each a single capped parallel query.
Route: `GET /api/v1/search?q=…`.

### 8 · Pagination — cursor + offset, sorting, filtering, search
Offset pagination (existing `paginate`) **and** new cursor/keyset pagination
(`BaseRepository.cursorPage` + `listCursor` on client/product/document repos +
`cursorQuerySchema`). Allow-listed sorting (`parseSort` against per-entity `*_SORTABLE`).
Typed per-aggregate filters + case-insensitive search.

### 9 · Soft delete — restore, permanent delete, deleted list
The full recycle-bin lifecycle lives once in `TenantCrudService` (+ document service):
`softDelete` → `restore` → `hardDelete` (works on already-soft-deleted rows) → `listDeleted`.
Exposed on clients, products, and documents.

### 10 · Audit log — every mutation
Every create/update/delete/restore/purge/status-change writes an `AuditLog` (actor,
target, before/after snapshots — secret-redacted, JSON-safe DTO snapshots). Read via
`GET /api/v1/audit` (`audit:read`). Non-throwing (an audit failure never breaks the action).

### 11 · Activity timeline — every business action
Each mutation also writes a human-readable `ActivityEvent` (attributed to the actor).
Read via `GET /api/v1/activity` and surfaced in the dashboard feed.

---

## Rules honored

- **Transactions** — document create (number allocation + doc + items) and workspace create
  run in `runInTransaction`; document item-replacement on update is transactional.
- **No N+1** — dashboard uses aggregate/groupBy + one bounded window; lists use nested
  includes (`createWithItems`, `findByIdWithItems`); search runs capped parallel queries.
- **Tenant / workspace safe** — all reads/writes funnel through `TenantRepository` scoping
  (or explicit `workspaceId` where a model spans tenants); search never leaves the tenant.
- **Permission protected** — every route declares its RBAC permission (or `requireMembership`
  + service-level ownership for documents).
- **Validated / typed** — Zod at the route wrapper **and** re-validated in services; end-to-end
  types from query → service → DTO.

---

## Files added / changed

**Repositories (new):** `activity`, `document-sequence`, `template`, `dashboard`; `cursor.ts`.
**Repositories (extended):** `base` (cursorPage), `client` / `product` / `document`
(hardDelete + listDeleted + sort + cursor + richer filters), `tool` (findByOutputType),
`workspace` (settings + default-template).
**Services (new):** `activity`, `client`, `product`, `template`, `document`, `workspace`,
`dashboard`, `search`; enhanced `crud.service` (base).
**Utils (new):** `document-totals`.
**Validation (new/extended):** `document.schema`; `common.schema` (cursor/search/dashboard
queries); `template.schema` (duplicate).
**DTOs (new/extended):** `template`, `dashboard`, `search`, `activity`+`audit`; `document`
(items + detail).
**Routes (new, `app/api/v1/`):** `clients*`, `products*`, `templates*`, `documents*`,
`workspaces`, `workspace`, `dashboard`, `search`, `activity`, `audit`.
**Tests (new):** `document-totals`, `dashboard`, `crud-base`.

---

## Tests (12 new)

| Suite | Focus |
|-------|-------|
| `document-totals.test.ts` | totals engine — exclusive/inclusive tax, %/fixed discount (clamped), shipping, unapplied facets |
| `dashboard.test.ts` | KPI percent-change math (deltas, empty previous, rounding) |
| `crud-base.test.ts` | `TenantCrudService` full audited lifecycle (create→update→soft-delete→restore→purge) + Zod validation + DTO/pagination, via an in-memory repo with audit/activity spies |

All offline (no live DB), matching the project's established testing philosophy.

---

## Frozen-frontend guarantee

Verified: **0** files changed under `components/`, the frozen `lib/*-data.ts` /
`lib/invoice-types.ts` type files, any CSS/Tailwind/token file, or any non-API `app/**.tsx`
page/layout. All 57 frozen routes still build; the CRUD engine is purely additive API
surface, ready for the frozen UI to consume as a drop-in replacement for its mock data.

---

## Verification commands

```bash
npm run typecheck   # 0 errors
npm run build       # exit 0 — 57 frozen routes + /api/v1/{clients,products,templates,documents,workspace(s),dashboard,search,activity,audit}
npm run test        # 82/82 pass (offline)
```

**Business CRUD engine is complete and green. Mission 5 done.**
