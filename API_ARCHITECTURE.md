# ToolForge — API & Application Architecture

> **Design document (no implementation).** Layered backend for Next.js 16 (App
> Router) + TypeScript + Prisma + Supabase. Covers folder structure, repository
> pattern, service layer, API design, middleware, validation, and the cross-cutting
> engines (invoice, payment, email, notification, tool runtime).
> The frozen frontend consumes this backend by swapping `lib/*-data.ts` imports for
> data fetches — **no component, route, or token changes.**

---

## 1. Layered architecture

One request flows through fixed, one-directional layers. Each layer has one job and
only talks to the layer directly beneath it.

```
 Frozen UI (Server/Client Components, React Hook Form)
        │  fetch() / Server Action
        ▼
 ┌─────────────────────────────────────────────────────────┐
 │ 1. Edge Middleware   auth gate · workspace hint · headers │
 ├─────────────────────────────────────────────────────────┤
 │ 2. Route Handler / Server Action  (thin transport layer)  │
 │    - parse → validate (Zod) → build RequestContext        │
 │    - call ONE service method → shape response envelope    │
 ├─────────────────────────────────────────────────────────┤
 │ 3. Middleware chain (composable): authGuard · tenant       │
 │    resolve · RBAC · rate-limit · entitlement · audit       │
 ├─────────────────────────────────────────────────────────┤
 │ 4. Service Layer  (business rules, transactions, events)   │
 ├─────────────────────────────────────────────────────────┤
 │ 5. Repository Layer  (tenant-scoped data access)           │
 ├─────────────────────────────────────────────────────────┤
 │ 6. Prisma Client  →  Supabase PostgreSQL                   │
 └─────────────────────────────────────────────────────────┘
        External adapters (side layer, called by services):
        Storage · Email · Payments · PDF · Realtime · Queue
```

**Golden rules**

- Route handlers contain **no business logic** — parse, validate, delegate, respond.
- Services contain **no Prisma queries** — they call repositories.
- Repositories contain **no business logic** — they encapsulate tenant-scoped queries.
- **Nothing skips a layer.** A route never touches Prisma; a service never touches
  `req`/`res`. This is what makes 100+ tools maintainable.

---

## 2. Folder structure

```
toolforge/
├─ app/                              # FROZEN — pages/components/layouts untouched
│  ├─ (site)/ auth/ onboarding/ invoice/ dashboard/ design-system/
│  └─ api/                           # NEW — route handlers only (thin)
│     ├─ auth/[...nextauth]/route.ts
│     ├─ workspaces/route.ts
│     ├─ workspaces/[id]/members/route.ts
│     ├─ documents/route.ts                 # ?type=INVOICE|QUOTE|...
│     ├─ documents/[id]/route.ts
│     ├─ documents/[id]/send/route.ts
│     ├─ documents/[id]/pdf/route.ts
│     ├─ clients/route.ts  · clients/[id]/route.ts
│     ├─ products/route.ts
│     ├─ tools/route.ts    · tools/[slug]/run/route.ts   # calculator tools
│     ├─ payments/route.ts
│     ├─ files/sign/route.ts                 # signed upload URLs
│     ├─ notifications/route.ts
│     └─ webhooks/{stripe,razorpay,resend}/route.ts
│
├─ server/                          # NEW — all backend logic (never imported by UI directly)
│  ├─ config/            env.ts (Zod-validated), constants.ts
│  ├─ db/                prisma.ts (singleton), rls.ts
│  ├─ auth/              authOptions.ts, session.ts, twofactor.ts, password.ts
│  ├─ context/           request-context.ts   # {user, workspace, membership, role}
│  ├─ middleware/        with-auth.ts, with-tenant.ts, with-rbac.ts,
│  │                     with-validation.ts, with-rate-limit.ts,
│  │                     with-entitlement.ts, with-audit.ts, compose.ts
│  ├─ repositories/      base.repository.ts, tenant.repository.ts,
│  │                     document.repository.ts, client.repository.ts,
│  │                     product.repository.ts, workspace.repository.ts,
│  │                     payment.repository.ts, notification.repository.ts,
│  │                     tool.repository.ts, audit.repository.ts
│  ├─ services/          document.service.ts, invoice.service.ts,
│  │                     quote.service.ts, receipt.service.ts,
│  │                     workspace.service.ts, member.service.ts,
│  │                     billing.service.ts, payment.service.ts,
│  │                     tool.service.ts, calculator.service.ts,
│  │                     numbering.service.ts, totals.service.ts,
│  │                     audit.service.ts, activity.service.ts
│  ├─ tools/             # THE PLUG-IN SURFACE (one folder per tool)
│  │  ├─ registry.ts             # ToolHandler map keyed by schemaKey
│  │  ├─ types.ts                # ToolHandler<TInput,TOutput> interface
│  │  ├─ invoice/     schema.ts · handler.ts · pdf.tsx
│  │  ├─ quote/       schema.ts · handler.ts · pdf.tsx
│  │  ├─ receipt/ · salary-slip/ · purchase-order/ · credit-note/
│  │  ├─ gst-calculator/   schema.ts · handler.ts
│  │  ├─ emi-calculator/ · loan-calculator/ · number-to-words/
│  │  └─ qr-generator/ · barcode-generator/
│  ├─ adapters/         storage.ts (Supabase), email.ts (Resend),
│  │                    payments/{stripe,razorpay}.ts, pdf.ts, realtime.ts
│  ├─ jobs/             overdue-sweeper.ts, recurring-billing.ts,
│  │                    reminders.ts, cleanup.ts
│  └─ errors/           app-error.ts, error-map.ts
│
├─ lib/                             # FROZEN business/data helpers stay; new shared
│  ├─ validation/       # Zod schemas shared by RHF (client) AND services (server)
│  │  ├─ auth.schema.ts  invoice.schema.ts  client.schema.ts  ...
│  └─ dto/              # response types the frozen components already expect
│
├─ prisma/              schema.prisma · seed.ts · migrations/
└─ types/               api.ts (envelope), context.ts
```

Key idea: **`app/api` is transport, `server/` is the brain, `lib/validation` is the
contract shared with React Hook Form.** The frozen `app/(site|dashboard|...)` tree is
never restructured.

---

## 3. Repository pattern (tenant-safe data access)

Repositories are the *only* place Prisma is touched. A base class enforces the
tenant filter so **it is impossible to write a query that forgets `workspaceId`**.

```ts
// base.repository.ts — non-tenant (User, Tool catalogue, Plan)
abstract class BaseRepository<T> {
  constructor(protected db: PrismaClient) {}
}

// tenant.repository.ts — every workspace-scoped model extends this
abstract class TenantRepository<Delegate> {
  constructor(protected db: PrismaClient, protected workspaceId: string) {}

  // all reads auto-inject the tenant + soft-delete filter
  protected scope<W>(where: W) {
    return { ...where, workspaceId: this.workspaceId, deletedAt: null }
  }
}

class DocumentRepository extends TenantRepository<Prisma.DocumentDelegate> {
  findById(id: string)      { return this.db.document.findFirst({ where: this.scope({ id }) }) }
  list(filter: DocFilter)   { return this.db.document.findMany({ where: this.scope(filter), /*pagination*/ }) }
  create(data, tx?)         { /* runs inside a service transaction */ }
}
```

- Repositories are **instantiated per-request** with the resolved `workspaceId` from
  `RequestContext` — never a global.
- They expose **intention-revealing methods** (`findOverdue()`, `listByClient()`), not
  a generic query passthrough, so business queries are centralised and testable.
- Cross-cutting reads (catalogue `Tool`, `Plan`) use `BaseRepository` (no tenant).

**Why this matters for the mission:** a repository per aggregate + a hard tenant
boundary is what lets dozens of engineers add tools without ever leaking one
workspace's invoices into another's dashboard.

---

## 4. Service layer (business rules & transactions)

Services own **business rules, transaction boundaries, and event emission**. They
consume repositories + adapters and return DTOs.

```ts
class InvoiceService {
  async create(ctx: RequestContext, input: InvoiceInput): Promise<InvoiceDTO> {
    return this.db.$transaction(async (tx) => {
      await this.billing.assertCanCreateDocument(ctx)          // plan entitlement (Free = 3/mo)
      const number = await this.numbering.next(ctx, 'INVOICE', tx)   // gap-free, row-locked
      const totals = this.totals.compute(input)                // server is source of truth
      const doc    = await this.docs.create({ ...input, number, ...totals }, tx)
      await this.audit.record(ctx, 'document.create', doc, tx)
      await this.activity.emit(ctx, 'Invoice Created', doc, tx)
      await this.billing.incrementUsage(ctx, tx)
      return toInvoiceDTO(doc)
    })
  }
}
```

Responsibilities:

| Concern | Where |
|---------|-------|
| **Transactions** | Service opens `$transaction`; repositories accept an optional `tx`. Numbering + totals + audit + usage all commit atomically or not at all. |
| **Status transitions** | `document.service` validates legal transitions (frozen `draft→sent→paid/overdue`); illegal ones throw `AppError`. |
| **Totals** | `totals.service` re-implements the frozen `calculateInvoiceTotals` as the authoritative computation; the UI preview is display-only. |
| **Entitlements** | `billing.service` enforces plan limits before create (frozen "3 docs/month" on Free). |
| **Events** | Every state change emits `audit.record()` + `activity.emit()` in the same transaction. |
| **Orchestration** | Sending an invoice = update status → render PDF → store file → queue email → notify → audit, coordinated by one service method. |

`document.service` is the shared base for all document tools; `invoice/quote/receipt/
salary-slip/purchase-order.service` add type-specific rules (quote → convert to
invoice; salary slip → net-pay computation).

---

## 5. Tool runtime (the "add 100+ tools" contract)

Every tool implements one interface and self-registers. Adding a tool = drop a folder
in `server/tools/<slug>/` + one seed row. **No routing, service, or schema changes.**

```ts
interface ToolHandler<TInput, TOutput> {
  schemaKey: string                 // "invoice.v1", "gst-calculator.v1"
  kind: ToolKind                    // DOCUMENT | GENERATOR | CALCULATOR | UTILITY
  input: ZodSchema<TInput>          // validates payload
  run(ctx: RequestContext, input: TInput): Promise<TOutput>
  toPdf?(data): ReactPdfDoc         // DOCUMENT/GENERATOR tools only
}
```

- **DOCUMENT/GENERATOR tools** (invoice, quote, receipt, salary slip, PO, credit note,
  QR, barcode): `run()` persists a `Document`/`FileObject` via the document service.
  Routed through `POST /api/documents?type=…` — one endpoint, dispatched by `toolId`.
- **CALCULATOR/UTILITY tools** (GST, EMI, loan, number-to-words, unit converter,
  profit margin): `run()` is pure compute, optionally persisting a `ToolRun`. Routed
  through `POST /api/tools/[slug]/run` — one generic endpoint for *all* calculators.

```
registry.ts:
  import invoice from './invoice/handler'
  import gst     from './gst-calculator/handler'
  export const TOOL_REGISTRY = index([invoice, quote, receipt, gst, emi, ...], 'schemaKey')
```

The `tool.service` looks up the handler by the `Tool.schemaKey` column, validates
input against `handler.input`, and dispatches. This is the single seam that satisfies
*"support 100+ future tools without redesigning the backend."*

---

## 6. API design conventions

### 6.1 Route handlers vs Server Actions
- **Server Actions** for form mutations already wired to the frozen React Hook Form
  screens (onboarding, invoice builder save, settings) — colocated, typed, no manual
  fetch.
- **Route Handlers (`app/api/*`)** for: webhooks, file/PDF streaming, external/mobile
  consumers, and anything needing custom headers or streaming.
- Both call the **same service methods** — transport choice never duplicates logic.

### 6.2 Resource conventions (REST-ish)
```
GET    /api/documents?type=INVOICE&status=draft&sort=date&order=desc&page=1
POST   /api/documents            (body.type selects the tool)
GET    /api/documents/:id
PATCH  /api/documents/:id
DELETE /api/documents/:id        (soft delete)
POST   /api/documents/:id/send
POST   /api/documents/:id/pdf
POST   /api/tools/:slug/run
```
Query params **mirror the frozen URL params** in `ROUTE_MAP.md` (e.g.
`/dashboard/invoices?status=draft&sort=date&order=desc`) so the UI's existing filter
state maps 1:1 to the API.

### 6.3 Response envelope (stable contract)
```ts
type ApiResponse<T> =
  | { ok: true;  data: T; meta?: { page; pageSize; total } }
  | { ok: false; error: { code: string; message: string; fields?: Record<string,string> } }
```
- `fields` carries per-field validation errors so React Hook Form can call
  `setError()` — matching the frozen forms' inline error UI with no redesign.
- Cursor/offset pagination in `meta` powers the frozen data tables.
- `code` is a stable machine string (`DOCUMENT_NOT_FOUND`, `PLAN_LIMIT_REACHED`).

### 6.4 Idempotency & concurrency
- Mutations that must not double-apply (payments, sends) accept an
  `Idempotency-Key` header stored on `Payment.idempotencyKey`.
- Document edits use `updatedAt`-based optimistic concurrency (reject stale writes),
  which pairs with the frozen invoice builder's autosave/undo-redo without UI change.

---

## 7. Middleware

Two tiers:

### 7.1 Edge middleware (`middleware.ts`)
Runs on the frozen protected routes (`/dashboard/*`, `/invoice/*`, `/onboarding/*`
per `ROUTE_MAP.md`): checks the session cookie, redirects unauthenticated users to
`/auth/sign-in`, and forwards a workspace hint. Fast, no DB. Public/`(site)` and
`/auth/*` routes pass through.

### 7.2 API middleware chain (composable per route)
Ordered, short-circuiting functions composed with `compose()`:

```
compose(withRateLimit, withAuth, withTenant, withRbac('document:create'),
        withEntitlement('docsPerMonth'), withValidation(invoiceSchema), withAudit)
```

| Middleware | Responsibility |
|------------|----------------|
| `withRateLimit` | Per-user + per-workspace limits (protects noisy-neighbour). |
| `withAuth` | Resolves Auth.js session → `ctx.user`, else 401. |
| `withTenant` | Resolves active workspace (from header/switcher) + membership → `ctx.workspace`, `ctx.membership`, `ctx.role`; 403 if not a member. |
| `withRbac(perm)` | Checks role→permission map (see `RBAC.md`); 403 on deny. |
| `withEntitlement(key)` | Checks plan entitlement/quota (see `RBAC.md §Two axes`). |
| `withValidation(schema)` | Zod-parses body/query into typed input; 422 with `fields`. |
| `withAudit` | Wraps the handler to emit an `AuditLog` on success/failure. |

The chain builds an immutable `RequestContext` passed to the service — services never
see `Request`.

---

## 8. Validation strategy (one Zod schema, both sides)

**Single source of truth:** every input schema lives once in `lib/validation/*` and is
imported by **both** the React Hook Form resolver (client) **and** the service
middleware (server). No drift, no double-definition.

```
lib/validation/invoice.schema.ts
   ├─ used by  app/invoice/new  (RHF + @hookform/resolvers/zod)   ← frozen form, new resolver
   └─ used by  server/middleware/withValidation                    ← API/Action guard
```

- **Layered schemas:** `BaseDocumentSchema` (shared fields) is `.extend()`-ed per tool
  (`InvoiceSchema`, `SalarySlipSchema`) — mirroring the polymorphic `Document`.
- **Tool payloads:** each `server/tools/<slug>/schema.ts` exports the Zod schema
  referenced by `Tool.schemaKey`; the runtime validates `payload`/`input` against it.
- **Coercion & currency:** money parsed as strings → `Decimal` to avoid float drift;
  matches frozen currency/tax unions (`Currency`, `TaxType`, `TaxBasis`).
- **Trust boundary:** client validation is UX only; the server **always** re-validates.
  Totals/tax are recomputed server-side regardless of submitted values.

---

## 9. Invoice engine (service view)

Complements the data view in `DATABASE_ARCHITECTURE.md §8`.

```
POST /api/documents (type=INVOICE)
  → withValidation(InvoiceSchema)
  → InvoiceService.create()
       ├─ billing.assertCanCreateDocument   (Free = 3/mo)
       ├─ numbering.next('INVOICE')          (row-locked, gap-free)
       ├─ totals.compute()                   (subtotal→discount→shipping→tax in/exclusive)
       ├─ docs.create(+items)                (snapshot issuer/recipient)
       ├─ audit + activity + usage++
       └─ return InvoiceDTO  → maps to frozen InvoiceData shape

POST /api/documents/:id/send
  → InvoiceService.send(): status DRAFT→SENT · render PDF · store file
                          · queue INVOICE_SENT email · notify · audit
```
`OVERDUE` is applied by `jobs/overdue-sweeper` (scheduled), not by the request path.
The frozen builder's autosave maps to `PATCH /api/documents/:id` (debounced), undo/
redo stays client-side; only committed states persist.

---

## 10. Payment architecture (service view)

- **`payment.service`** records payments (manual + gateway) and updates
  `Document.amountPaid` / status via `PaymentAllocation`.
- **Gateways** (`adapters/payments/stripe.ts`, `razorpay.ts`) are behind a
  provider-agnostic interface (`createCheckout`, `verifyWebhook`, `parseEvent`), so a
  new gateway is an adapter, not a rewrite.
- **Webhooks** (`/api/webhooks/{stripe,razorpay}`) verify signatures, dedupe via
  `idempotencyKey`, and call `payment.service.applyGatewayEvent()`. Webhook handlers
  are transport-only.
- **Manual payments** (frozen "Payment Recorded" activity) go through the same service
  with `provider = MANUAL`.
- Subscriptions (Free/Pro/Business upgrades from the frozen pricing page) are handled
  by `billing.service` + gateway subscription webhooks, updating `Subscription`.

---

## 11. Email architecture (service view)

- **`adapters/email.ts`** wraps a provider (**Resend** recommended; SendGrid pluggable)
  behind `send(kind, to, data)`; persists an `EmailMessage` row for every send.
- **Templating:** typed React email templates per `EmailKind`
  (VERIFY, RESET, INVITE, INVOICE_SENT, REMINDER, RECEIPT, PAYMENT_CONFIRMED) — brand
  colors sourced from `WorkspaceSettings`, never hard-coded, so branded emails match
  the frozen design tokens.
- **Delivery:** enqueue → send → provider webhook (`/api/webhooks/resend`) updates
  `status`/`openedAt`. Async so requests never block on SMTP.
- Every frozen email-triggering flow (auth codes, invites, invoice send, reminders)
  maps to exactly one `EmailKind`.

---

## 12. Notification architecture (service view)

- **`notification.service.dispatch(event)`** fans an event out to recipients (e.g.
  "invoice paid" → all workspace admins), writing one `Notification` row per recipient
  (category ∈ frozen `INVOICE|PAYMENT|SYSTEM|TEAM`).
- **Channels:** `IN_APP` always; `EMAIL` per user preference; extensible (SMS/webhook)
  without schema change (`channelsSent: String[]`).
- **Real-time:** optional **Supabase Realtime** subscription on the `Notification`
  table pushes to the frozen topbar bell / `/dashboard/notifications` — the UI just
  re-renders the same list it already renders from mock data.
- Read/seen state via `PATCH /api/notifications/:id`.

---

## 13. Background jobs & async

Scheduled/queued work that must not sit in the request path:

| Job | Trigger | Does |
|-----|---------|------|
| `overdue-sweeper` | daily cron | `SENT` + past `dueDate` → `OVERDUE` (+ notify). |
| `recurring-billing` | daily cron | Frozen "Recurring Billing" tool — generate invoices from rules. |
| `reminders` | daily cron | Frozen "Payment Reminders" tool — tiered reminder emails, auto-stop on payment. |
| `cleanup` | hourly cron | Purge expired tokens/invitations, GC orphaned files. |

Runtime: **Supabase scheduled functions / Vercel Cron** invoking internal, secured
job routes. Each job is a thin trigger calling a service method (same code path as
interactive use).

---

## 14. Error handling & observability

- **`AppError`** hierarchy (`NotFoundError`, `ForbiddenError`, `ValidationError`,
  `PlanLimitError`) → mapped to HTTP + stable `code` by `error-map.ts`. No stack traces
  leak in production (a gap `ROUTE_MAP.md` explicitly flagged).
- **Structured logging** with request id, workspace id, actor id (never PII/secrets).
- **`error.tsx` / `not-found.tsx`** boundaries wire to the frozen error UI.
- Audit log doubles as a security-observability stream.

---

## 15. Coverage check

| Mission topic | Section |
|---|---|
| Folder Structure | §2 |
| Repository Pattern | §3 |
| Service Layer | §4 |
| API Architecture | §6 |
| Middleware | §7 |
| Validation Strategy | §8 |
| Invoice Engine Architecture | §9 (+ `DATABASE_ARCHITECTURE.md §8`) |
| Payment Architecture | §10 |
| Email Architecture | §11 |
| Notification Architecture | §12 |
| Future Tool Registry (runtime) | §5 |
| Authentication / Authorization | → `AUTH_FLOW.md`, `RBAC.md` |
| File Storage | → `STORAGE_PLAN.md` |

**Next:** `AUTH_FLOW.md`, `RBAC.md`, `STORAGE_PLAN.md`.
