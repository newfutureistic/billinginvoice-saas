# ToolForge — API Foundation Report

> **Mission 3 — Enterprise API Foundation.** Status: **complete & green.**
> Scope honored: reusable backend application layer only. **No authentication, no
> invoice engine/CRUD, no payments, no emails, no storage implementation, no frontend
> integration.** The frozen frontend is untouched and still builds all 57 routes.

---

## Results

| Check | Result |
|-------|--------|
| `npm run typecheck` (`tsc --noEmit`) | **0 errors** — before and after build (validates Next 16 route-handler types in `.next/types`). |
| `npm run build` (`next build`) | **exit 0** — 57 frozen routes + 3 new `/api/v1` route handlers compiled. |
| `npm run test` (node:test + tsx) | **29/29 pass** — offline regression over utils, response, errors, validation, DTO. |

Database foundation from Mission 2 remains intact; this mission is purely additive under
`server/`, `lib/validation/`, `lib/dto/`, and `app/api/`.

---

## 1. Folder structure

```
server/
├─ config/env.ts                    # (Mission 2) validated environment
├─ db/                              # (Mission 2) prisma, logger, errors, transaction, utils
├─ errors/                          # ── Error system ──
│  ├─ http-status.ts                #   HTTP status constants
│  ├─ error-codes.ts                #   stable machine codes
│  ├─ app-error.ts                  #   AppError hierarchy (typed, 4xx/5xx)
│  ├─ error-handler.ts              #   toAppError: Zod / Prisma / DatabaseError → AppError
│  └─ index.ts
├─ http/                            # ── API layer ──
│  ├─ context.ts                    #   RequestContext / WorkspaceContext
│  ├─ response.ts                   #   ONE envelope: successBody / errorBody / ListResult
│  ├─ handler.ts                    #   defineRoute() — typed wrapper + middleware chain
│  ├─ index.ts
│  └─ middleware/                   # ── Middleware ──
│     ├─ request-id.ts  logging.ts  security-headers.ts  cors.ts
│     ├─ rate-limit.ts (interface + in-memory + noop)
│     ├─ validation.ts  tenant.ts   workspace.ts  index.ts
├─ repositories/                    # ── Repository layer ──
│  ├─ base.repository.ts            #   run() error funnel + paginate()
│  ├─ tenant.repository.ts          #   scope() / activeScope() tenant guard
│  ├─ query.ts                      #   ListOptions + resolveOrderBy (sorting)
│  ├─ types.ts                      #   Read / Write / SoftDelete contracts
│  ├─ document|client|product|workspace|tool.repository.ts
│  └─ index.ts
├─ services/                        # ── Service layer ──
│  ├─ base.service.ts               #   ctx + scoped logger
│  ├─ crud.service.ts               #   reusable generic TenantCrudService
│  ├─ validation.service.ts  logging.service.ts  error.service.ts
│  ├─ notification.service.ts (interface + noop)
│  ├─ storage.service.ts (interface + 501 default)
│  └─ index.ts
└─ utils/                           # ── Utility layer ──
   ├─ date.ts  currency.ts  tax.ts  invoice-number.ts
   ├─ decimal.ts  sort.ts  search.ts  filters.ts  index.ts

lib/
├─ validation/  *.schema.ts         # ── Zod schemas (11 entities + common) ──
└─ dto/         *.dto.ts            # ── Output DTOs + pure mappers ──

app/api/v1/                         # ── Versioned route handlers ──
├─ health/route.ts
└─ tools/route.ts  ·  tools/[slug]/route.ts

tests/                              # ── Offline regression (node:test) ──
└─ utils · response · errors · validation · dto .test.ts
```

Design rule preserved from the approved architecture: **`app/api` is thin transport,
`server/` is the brain, `lib/validation` + `lib/dto` are the shared contract.** No layer
skips another; the frozen `app/(site|dashboard|…)` tree is never touched.

---

## 2. Service architecture

Layered, one-directional: **Route → (middleware) → Service → Repository → Prisma**,
with adapters (notification/storage) on the side.

- **`BaseService`** carries the `RequestContext` (request id, workspace, correlated
  logger) so business logic never re-reads the HTTP request.
- **`TenantCrudService<Model, DTO, CreateInput, UpdateInput, CreateData, UpdateData,
  Filter>`** — a reusable, abstract business service. A concrete service supplies its
  repository, Zod schemas, DTO mapper, and input→data mappers and inherits validated,
  tenant-scoped, DTO-shaped `get/list/create/update/remove/restore`. Ships abstract by
  design (concrete feature services are later missions).
- **Cross-cutting services:** `ValidationService` (throwing + safe variants),
  `serviceLogger`, `error.service` (`normalizeError`/`reportError` for non-HTTP call
  sites).
- **Interfaces (implementation deferred):** `NotificationService` (+ `Noop` default)
  and `StorageService` (+ a default that raises `501 NotImplemented`, so nothing
  silently pretends to work).

---

## 3. Repository architecture

Extends the Mission-2 foundation (all data access funnels through repositories; Prisma
is touched nowhere else).

- **`BaseRepository`** — `run()` wraps every Prisma call in `mapPrismaError`; `paginate()`
  standardizes offset pagination (count + page in one call).
- **`TenantRepository`** — `scope()` / `activeScope()` inject `workspaceId`
  (+ `deletedAt: null`) into every `where`, so a subclass *cannot* forget the tenant
  boundary or return soft-deleted rows.
- **Query options** (`query.ts`) — `ListOptions` + `resolveOrderBy(raw, allowed,
  fallback)` give **allow-listed sorting**; filtering is expressed as typed per-aggregate
  filter objects (`DocumentFilter`, `ClientFilter`, `ProductFilter`); pagination + soft
  delete are built in. `DocumentRepository.list(filter, pagination, sort)` demonstrates
  all four together.
- **Contracts** (`types.ts`): `ReadRepository`, `WriteRepository`, `SoftDeleteRepository`
  — composed per aggregate so services depend on interfaces, not Prisma.

---

## 4. Middleware chain

`defineRoute()` runs a fixed, ordered chain; any middleware may throw an `AppError`
which the wrapper renders as the standard error envelope. Order:

```
request-id → security headers + CORS (+ OPTIONS preflight short-circuit 204)
  → logging(start) → rate limit (opt) → tenant resolution (opt)
  → workspace resolution (opt) → validate params/query/body (Zod)
  → HANDLER → success envelope → logging(end)
                     └── on throw → toAppError → error envelope → logging(end)
```

| Middleware | Behavior |
|------------|----------|
| **Request ID** | Reuses inbound `x-request-id` (traceable) or mints a UUID; echoed on every response + log line. |
| **Logging** | `request.start` / `request.end` with method, path, status, duration. |
| **Error handling** | Single `try/catch` in the wrapper → `toAppError` → typed envelope; 5xx messages hidden. |
| **Rate limiting** | Interface + in-memory + noop; `enforceRateLimit` throws `429` with `Retry-After`. Pluggable to Redis with no call-site change. |
| **CORS** | Config-driven origin/methods/headers; preflight handled. |
| **Security headers** | `nosniff`, `DENY` frame, `no-referrer`, HSTS, `Permissions-Policy`, CORP. |
| **Request validation** | Zod parse of params/query/body → typed inputs or `422` with field errors. |
| **Tenant resolution** | Reads `x-workspace-id` (or `?workspaceId=`) → `ctx.workspaceId` (no DB, no auth). |
| **Workspace resolution** | Loads + validates the workspace exists (not soft-deleted) → `ctx.workspace`. Membership/authz intentionally deferred to the auth mission. |

---

## 5. Validation coverage

Zod schemas, one module per entity (`lib/validation/`), shared-ready for RHF later:

| Entity | Schemas |
|--------|---------|
| **Common** | id, email, slug, hex color, pagination query, sort query, enum tuples, `listQuerySchema()` composer |
| **Invoice** | business/client party, line item, tax config, discount, shipping, create/update |
| **Client** | create / update / filter / list-query |
| **Product** | create / update / filter / list-query |
| **Template** | colors + create / update |
| **User** | profile create / update (no credentials) |
| **Workspace / Organization** | workspace create/update + organization settings + address |
| **Plan** | plan + entitlements |
| **Notification** | create / update / filter / list-query |
| **File** | upload-request / commit |
| **Payment** | record / allocation |

All 11 required entities covered. Validation is enforced at two points: the route
wrapper (`schema.body/query/params`) and inside services (`ValidationService` /
`TenantCrudService`). The server always re-validates untrusted input.

---

## 6. Error strategy

- **Typed hierarchy** (`AppError` + `ValidationError`, `BadRequestError`,
  `UnauthenticatedError`, `AuthorizationError`, `NotFoundError`, `ConflictError`,
  `BusinessError`, `RateLimitError`, `TenantRequiredError`, `InternalError`,
  `NotImplementedError`, `ServiceUnavailableError`). Each carries a stable `code`, an
  HTTP status, optional `fields`/`details`, and an `expose` flag.
- **Global normalizer** `toAppError` maps everything to an `AppError`: Zod →
  `ValidationError` (422 + field map), `DatabaseError`/Prisma known errors → the right
  4xx/5xx (unique→409, FK→400, not-found→404, connection→503), unknown → `InternalError`
  (500).
- **Formatter** `errorBody` emits the standard error envelope and **hides 5xx messages
  and details** from clients (no leakage); 4xx expose message + field errors.
- **Layering**: the data layer throws `DatabaseError`; the API boundary converts to
  `AppError`. Prisma internals never escape.

---

## 7. API standards

- **One response envelope** for every endpoint:
  ```jsonc
  // success
  { "success": true, "data": <T>, "meta": { "requestId": "…", "timestamp": "…" } }
  // error
  { "success": false, "error": { "code": "…", "message": "…", "fields": {…}, "details": … },
    "meta": { "requestId": "…", "timestamp": "…" } }
  ```
  Lists carry `data: { items: [...], pagination: {...} }` — a single format, no special
  list envelope.
- **Typed request & response**: `defineRoute<Data, Body, Query, Params>()` gives every
  endpoint a validated, typed request (via Zod schemas) and a typed `Data` payload.
- **Versioning**: routes live under `/api/v1/*`; a future `/api/v2` coexists without
  touching v1.
- **HTTP status strategy**: 200/201/204 success; 400 malformed, 401 unauthenticated,
  403 forbidden, 404 missing, 409 conflict, 422 validation, 429 rate-limited, 500/501/503
  server. Codes are assigned by the `AppError` type, never ad hoc.
- **Reusable**: handlers contain only business logic; middleware, validation, error
  handling, and formatting are shared by construction.
- **Demonstrator routes**: `GET /api/v1/health` (system probe), `GET /api/v1/tools`
  (list → DTO → `{items,pagination}` + rate limit), `GET /api/v1/tools/[slug]` (typed
  param + `404` via the error funnel).

---

## 8. Future extensibility

- **New endpoint** = one `defineRoute({...})` file; it inherits the entire chain
  (validation, tenancy, rate limit, errors, envelope) for free.
- **New entity CRUD** = a repository (extend `TenantRepository`) + a `TenantCrudService`
  subclass wiring schema + mapper. No new infrastructure.
- **New tool** (the 100+ roadmap) plugs into the same document repository/DTO/validation
  seam — no backend redesign, exactly as the approved architecture promised.
- **Swap infrastructure** without touching call sites: `RateLimiter` → Redis;
  `StorageService` → Supabase Storage; `NotificationService` → real fan-out. All are
  interfaces with default implementations today.
- **Auth mission slots in cleanly**: `workspace.ts` already resolves the tenant; adding
  membership/permission checks is a middleware addition, and `UnauthenticatedError`/
  `AuthorizationError` already exist in the error contract.
- **API v2** coexists beside v1 under `app/api/v2` with the same building blocks.

---

## 9. Explicitly NOT implemented (per mission)

Authentication · Invoice CRUD / engine · Payments processing · Emails · Storage
implementation · Frontend integration. Interfaces and validation for these domains exist
(so later missions have a contract), but no behavior.

---

## 10. Verification commands

```bash
npm run typecheck   # 0 errors
npm run build       # exit 0 — 57 frozen routes + /api/v1/{health,tools,tools/[slug]}
npm run test        # 29/29 pass (offline)
```

**API foundation is production-ready and green. Stopping here and awaiting the next
mission.**
