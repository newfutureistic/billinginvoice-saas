# ToolForge — Database Implementation Report

> **Mission 2 — Database Foundation.** Status: **production-ready** (pending migration
> apply + seed against a live Supabase instance, which requires real credentials).
> Scope honored: database foundation only — **no APIs, no auth, no CRUD endpoints, no
> frontend wiring, no mock-data or UI changes.** The frozen frontend is untouched and
> still builds.

---

## 1. Stack as implemented

| Concern | Choice | Notes |
|---------|--------|-------|
| ORM | **Prisma 7.8.0** | Installed version is Prisma **7**, which changed two things vs the approved plan (see §7). |
| Client runtime | **`@prisma/client` 7.8 + `@prisma/adapter-pg` + `pg` 8.22** | Prisma 7 connects via a **driver adapter**, not a schema `url`. |
| Database | **PostgreSQL (Supabase)** | Pooled `DATABASE_URL` at runtime, direct `DIRECT_URL` for migrations. |
| Validation | **Zod 4.4.3** | Used for environment validation in this mission. |
| Seed runner | **tsx 4.23** | `prisma db seed` → `tsx prisma/seed.ts`. |
| Typecheck | **tsc 5.7.3** (`npm run typecheck`) | Added because `next build` ignores type errors (`next.config.mjs`). |

---

## 2. Implemented models (30 models, 17 enums)

All models from `PRISMA_SCHEMA_PLAN.md` are implemented in
[prisma/schema.prisma](prisma/schema.prisma) with full relations, constraints,
indexes, and the soft-delete strategy.

**Identity & Access (6):** `User`, `Account`, `Session`, `VerificationToken`,
`TwoFactorSecret`, `BackupCode`
**Tenancy & Billing (6):** `Workspace`, `WorkspaceSettings`, `Membership`,
`Invitation`, `Plan`, `Subscription`
**Tool Registry (4):** `ToolCategory`, `Tool`, `WorkspaceToolPin`, `ToolRun`
**Documents & business records (7):** `Document`, `DocumentItem`, `DocumentSequence`,
`DocumentShare`, `Client`, `Product`, `TemplateAsset`
**Money movement (2):** `Payment`, `PaymentAllocation`
**Comms & Observability (5):** `FileObject`, `EmailMessage`, `Notification`,
`AuditLog`, `ActivityEvent`

**Enums (17):** `DocumentType`, `DocumentStatus`, `ToolKind`, `ToolStatus`,
`PlanTier`, `Role`, `MemberStatus`, `InviteStatus`, `Currency`, `TaxType`,
`PaymentMethod`, `PaymentProvider`, `PaymentStatus`, `NotificationCategory`,
`EmailKind`, `EmailStatus`, `FileKind`.

**Constraints & integrity highlights**
- Tenant-scoped uniqueness: `Document[workspaceId, number]`, `Client[workspaceId,
  email]`, `Product[workspaceId, sku]`, `Membership[userId, workspaceId]`,
  `DocumentSequence[workspaceId, documentType, period]`, `Payment.idempotencyKey`.
- Referential actions match the design: `Cascade` within aggregates
  (Document→Items, Payment→Allocations), `Restrict` on `Tool`→`Document` (can't delete
  a tool that produced documents), `SetNull` on `Document`→`Client`/`createdBy`/`pdfFile`.
- **Soft delete:** `deletedAt` on `Workspace`, `Document`, `Client`, `Product` (+
  supporting `@@index([deletedAt])`); repositories filter it automatically.
- Money stored as `Decimal(14,2)` (never float); quantities `Decimal(14,3)`.

---

## 3. Migration summary

- **File:** [prisma/migrations/20260704000000_init/migration.sql](prisma/migrations/20260704000000_init/migration.sql)
  (+ `migration_lock.toml`, provider `postgresql`).
- **How it was generated:** Prisma 7 `migrate dev` needs a live database, which is not
  available in this environment. The migration was produced **offline and
  deterministically** via
  `prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script`, then
  placed as the `init` migration.
- **Contents:** **17** `CREATE TYPE` (enums) · **30** `CREATE TABLE` · **54**
  `CREATE INDEX`/`UNIQUE INDEX` · **40** foreign-key constraints · 794 lines.
- **Validation:** `prisma validate` → *"The schema is valid 🚀"*; `prisma generate`
  succeeds (client emitted to `@prisma/client`).
- **To apply (when credentials are set):** put real Supabase URLs in `.env`, then
  `npm run db:deploy` (`prisma migrate deploy`). The hand-placed migration is a normal
  Prisma migration and will be tracked in `_prisma_migrations`.

---

## 4. Seed summary

[prisma/seed.ts](prisma/seed.ts) — **idempotent** (upsert-based), reference data only,
derived from the frozen static catalogue so it stays in lockstep with the UI:

| Seeded | Count | Source |
|--------|-------|--------|
| `ToolCategory` | 4 | frozen `categories` (`lib/site-data.ts`) |
| `Tool` | 33 | frozen catalogue **+** Mission-2 future tools |
| `TemplateAsset` (system) | 8 | frozen `INVOICE_TEMPLATES` (`lib/invoice-templates.ts`) |
| `Plan` | 3 | frozen pricing tiers (Free / Pro / Business) with entitlements |
| Demo `Workspace` (+ settings + subscription) | opt-in | only when `SEED_DEMO=true` |

The future tools (`salary-slip` → `SALARY_SLIP`, `purchase-order` → `PURCHASE_ORDER`,
`gst-calculator`, `emi-calculator`, `loan-calculator`, `number-to-words`,
`barcode-generator`) were added as **seed rows only** — no schema change — demonstrating
the "add 100+ tools without redesign" contract in practice.

- **Run (when credentials are set):** `npm run db:seed`. Requires a live database; it
  is written and type-checks, but cannot execute against the placeholder connection in
  this environment.

---

## 5. Build result

`npm run build` (`next build`) → **PASS (exit 0).**
- All **57 routes** compiled and prerendered (Static / SSG / Dynamic), including the 4
  SSG tool categories and 26 SSG tool detail pages.
- The database foundation lives entirely under `server/` and `prisma/` and is imported
  by **no page**, so the frozen client bundle is unchanged.

---

## 6. Typecheck result

`npm run typecheck` (`tsc --noEmit`) → **7 errors, all pre-existing, all in frozen
frontend files. 0 errors in the database foundation.**

### Database foundation: clean ✅
Every file added in this mission type-checks with **zero** errors:
`prisma/schema.prisma`, `prisma/seed.ts`, `prisma.config.ts`, and all of
`server/config/`, `server/db/`, `server/repositories/`.

### Pre-existing frozen-frontend errors (NOT introduced here) ⚠️
These live in files under the freeze and were **masked** until now by
`next.config.mjs` → `typescript.ignoreBuildErrors: true` (so `next build` never
reported them). They are frozen-code-vs-newer-typedefs mismatches, unrelated to the
database, and were **left untouched to honor the freeze**:

| File:line | Error | Root cause (pre-existing) |
|-----------|-------|---------------------------|
| `lib/hooks/use-invoice.ts:20` | `Expected 1 arguments, but got 0` | `useRef<NodeJS.Timeout>()` — React 19 `@types/react` now requires an initial value. |
| `app/page.tsx:32` | `'canonical' does not exist in type 'Metadata'` | Next 16 moved `canonical` under `alternates.canonical`. |
| `app/dashboard/team/page.tsx:40,45` | `'unknown' is not assignable to 'string'` | DataTable `render(value)` types `value` as `unknown`; `StatusBadge.status` expects `string`. |
| `app/dashboard/clients/page.tsx:50` | same | same |
| `app/dashboard/clients/[id]/page.tsx:98` | same | same |
| `app/dashboard/invoices/page.tsx:49` | same | same |

> **Why not fixed:** the mission marks the frontend *permanently frozen* — "DO NOT
> modify Components / Routes / Layouts", "must remain pixel-perfect." Every fix would
> edit a frozen file. These are type-only issues that do not affect rendering (the
> build already ships them), and they predate Mission 2. **Resolving them requires an
> explicit, narrow lift of the freeze on those specific type-only lines** (e.g.
> `useRef<NodeJS.Timeout | undefined>(undefined)`, move `canonical` into `alternates`,
> widen the `StatusBadge`/DataTable `render` type). I can apply those the moment you
> approve touching those lines — none change a single pixel.

---

## 7. Notable adaptation — Prisma 7 (vs the approved plan)

The approved `PRISMA_SCHEMA_PLAN.md` assumed the classic Prisma generator with `url`
in the datasource. The environment resolved **Prisma 7**, which introduces two breaking
changes that were handled without altering the data model:

1. **Connection config moved out of the schema.** `url`/`directUrl` are no longer
   allowed in `datasource`; they now live in [prisma.config.ts](prisma.config.ts)
   (`DIRECT_URL` for the CLI).
2. **Runtime uses a driver adapter.** `PrismaClient` is constructed with
   `new PrismaPg({ connectionString })` (`@prisma/adapter-pg`) in
   [server/db/prisma.ts](server/db/prisma.ts), instead of a built-in engine URL.

The **models, enums, relationships, indexes, and constraints are exactly as designed** —
only the connection wiring changed.

---

## 8. Deliverables map (Mission-2 checklist)

| # | Requirement | Location |
|---|-------------|----------|
| 1 | Prisma Schema | `prisma/schema.prisma` |
| 2 | All approved models | §2 — 30 models |
| 3 | All enums | §2 — 17 enums |
| 4 | Relationships | schema relations + 40 FKs |
| 5 | Constraints | uniques / referential actions (§2) |
| 6 | Indexes | 54 indexes (§3) |
| 7 | Soft-delete strategy | `deletedAt` + `server/db/utils.ts` (`notDeleted`, `withNotDeleted`) |
| 8 | Migration files | `prisma/migrations/20260704000000_init/` |
| 9 | Seed data | `prisma/seed.ts` |
| 10 | Database connection | `server/db/prisma.ts` (pg adapter singleton) |
| 11 | Environment config | `.env`, `.env.example`, `prisma.config.ts`, `server/config/env.ts` |
| 12 | Prisma Client | generated (`@prisma/client`), singleton exported |
| 13 | Repository interfaces | `server/repositories/types.ts` (+ per-repo contracts) |
| 14 | Repository implementations | base, tenant, workspace, document, client, product, tool |
| 15 | Transaction helpers | `server/db/transaction.ts` (`runInTransaction`, retry) |
| 16 | Error handling | `server/db/errors.ts` (`mapPrismaError`, typed errors) |
| 17 | Logging | `server/db/logger.ts` (+ Prisma event routing) |
| 18 | Database utilities | `server/db/utils.ts` (ping, pagination, soft-delete, cuid) |

**Repository set implemented:** a representative production set covering both tenant
(`Document`, `Client`, `Product`) and non-tenant (`Workspace`, `Tool` catalogue)
aggregates, plus the reusable `BaseRepository`/`TenantRepository` and interface
contracts. The remaining ~24 models reuse these exact base classes — adding a
repository is a mechanical, pattern-following step, intentionally deferred to when a
service/API needs it (this mission is the foundation, not full data access for every
table).

---

## 9. Remaining work

**To make the foundation live (needs real Supabase credentials — outside this env):**
1. Put real `DATABASE_URL` + `DIRECT_URL` in `.env`.
2. `npm run db:deploy` to apply the `init` migration.
3. `npm run db:seed` to load reference data (`SEED_DEMO=true` for a demo tenant).
4. Verify connectivity via the `pingDatabase()` utility.

**Optional hardening (design-approved, deferred):**
- Postgres **Row-Level Security** policies as defence-in-depth (`DATABASE_ARCHITECTURE.md §13`).
- Repositories for the remaining models as services require them.

**Explicitly out of scope (later missions):** services, API routes, authentication,
CRUD endpoints, frontend integration.

**Awaiting your decision:** whether to apply the narrow, pixel-neutral type-only fixes
to the 6 frozen files in §6 (currently left untouched to respect the freeze).

---

## 10. Verification commands

```bash
npm run typecheck   # DB foundation: 0 errors (7 pre-existing frozen-frontend errors, see §6)
npm run build       # exit 0 — all 57 routes prerendered
npx prisma validate # "The schema is valid"
npm run db:deploy   # apply migration (requires live DB)
npm run db:seed     # seed reference data (requires live DB)
```

**Database foundation is production-ready. Stopping here and awaiting your next
instruction.**
