# ToolForge — Authentication & Authorization Implementation Report

> **Mission 4 — Enterprise Authentication & Authorization.** Status: **complete & green.**
> Backend only. The permanently-frozen frontend is **untouched** — no UI, JSX, Tailwind,
> routes, spacing, typography, colors, animations, or component APIs were modified. Every
> change is additive under `server/`, `lib/`, `app/api/`, `types/`, `tests/`, plus one
> edge `proxy.ts` (route redirects only — an explicitly-approved "safe change").

---

## Results

| Check | Result |
|-------|--------|
| `npm run typecheck` (`tsc --noEmit`) | **0 errors** |
| `npm run build` (`next build`) | **exit 0** — 57 frozen routes + 18 `/api` handlers + edge Proxy compiled |
| `npm run test` (node:test + tsx) | **70/70 pass** (29 pre-existing + **41 new**) |

Baseline before this mission was 0 / exit 0 / 29-pass; it remains green with the auth
layer added on top.

---

## 1. Stack (as mandated)

| Concern | Choice |
|---------|--------|
| Framework | **Auth.js (NextAuth v5)** — `next-auth@5.0.0-beta.31` (supports Next 16) |
| Adapter | **`@auth/prisma-adapter@2.11.2`** over the existing Prisma 7 + pg client |
| Password hashing | **`bcryptjs@3.0.3`** — standard `$2b$` bcrypt, no native build (portable on Windows/serverless) |
| Session strategy | **JWT** (required by the Credentials provider) made **revocable** by a server-side `Session` registry |
| Validation | **Zod** — reuses the existing `lib/validation` system, one new `auth.schema.ts` |
| DB / Tenancy / Errors / DTOs / Middleware | **reused** from Missions 2–3 (no parallel stacks) |

No Firebase / Better Auth / Clerk / Auth0 — Auth.js only, exactly as required.

> **Note on the design docs.** `AUTH_FLOW.md` proposed argon2id + database sessions;
> the mission body mandated **bcrypt**, and Auth.js's Credentials provider mandates the
> **JWT** strategy. Both mandates are honored; the `Session` table is repurposed as the
> revocation/audit ledger keyed by the JWT `sid`, giving server-side revocation on top of
> stateless JWTs (the enterprise pattern).

---

## 2. What was built (mapped to the mission)

### 1 · Auth.js configuration
- Split config: **`server/auth/auth.config.ts`** (edge-safe: session strategy, `pages`
  wired to the frozen auth routes, the `authorized` route guard) and
  **`server/auth/index.ts`** (Node: Prisma adapter, providers, JWT/session callbacks,
  secure cookies, OAuth workspace-bootstrap event).
- **Credentials** (email+password → `AuthService.authenticate`), **Google**, **GitHub**
  (auto-enabled only when their env vars are present).
- **JWT callback** mints a revocable `sid` on sign-in; **session callback** exposes
  `user.id` + `sid`; **events.createUser** provisions a first workspace for OAuth sign-ups.
- Type augmentation in **`types/next-auth.d.ts`**.

### 2 · Password security
- **`server/auth/password.ts`** — `hashPassword` / `verifyPassword` (bcrypt, cost via
  `BCRYPT_COST`), `needsRehash` (transparent work-factor upgrade on login).
- **`server/auth/tokens.ts`** — CSPRNG tokens, 6-digit codes, **SHA-256 hashing at rest**,
  constant-time compare (`timingSafeEqual`), purpose-namespaced identifiers, TTL helpers.
- Password **policy** lives once in `passwordSchema` (`lib/validation/auth.schema.ts`) and
  is reused everywhere — no duplicated rules.

### 3 · Session management
- **`server/services/session.service.ts`** over **`SessionRepository`** — `create`
  (remember-me TTL), `validate` (+ activity touch), `refresh` (token rotation + sliding
  expiry), `revoke`, `revokeAll` (sign-out-everywhere), `list`. `Session` gained additive
  columns (`rememberMe`, `ip`, `userAgent`, `revokedAt`, `lastActiveAt`, timestamps) via an
  offline migration — adapter-compatible.

### 4 · Authentication APIs (`app/api/v1/auth/*`, all thin `defineRoute`s)
`signup` · `signin` · `logout` · `forgot-password` · `reset-password` · `verify-email` ·
`resend-verification` · `change-password` · `refresh-session` · `current-user`, plus the
Auth.js catch-all **`app/api/auth/[...nextauth]`** (OAuth, CSRF, session, sign-out).

### 5 · RBAC (from `RBAC.md` §4 verbatim)
- **`server/auth/permissions.ts`** — `Permission` catalogue + `ROLE_PERMISSIONS` for all
  five roles (OWNER/ADMIN/MANAGER/MEMBER/VIEWER) + `ROLE_RANK`.
- **`server/auth/rbac.ts`** — `can` / `requirePermission`, hierarchy (`canManageRole`,
  `canAssignRole` — "≤ own level", no escalation), and `:any` / `:own` ownership decisions
  that **hide existence with 404** across the ownership boundary (RBAC.md §5).

### 6 · Workspace membership (`server/services/membership.service.ts`)
`invite` (no privilege escalation) · `acceptInvite` (email-matched) · `changeRole` ·
`removeMember` · `transferOwnership` (atomic promote/demote). **Last-owner protection** and
**no self-role-change** enforced in the service (so Server Actions are protected too).
Routes: `/api/v1/members`, `/api/v1/members/[userId]`, `/api/v1/workspace/transfer-ownership`,
`/api/v1/invitations/accept`.

### 7 · Middleware (composed into the existing `defineRoute` chain)
`authentication.ts` (session + registry revocation) · `workspace-access.ts` (membership +
role, suspends fail) · `permission.ts` (RBAC gate) · `csrf.ts` (origin allow-list) ·
`client-meta.ts` (ip/ua for audit). `defineRoute` gained opt-in `requireAuth`,
`requireMembership`, `permission`, `csrf` flags; **existing routes are unchanged** (all
flags default off). New chain order:

```
request-id → client-meta → security/CORS → logging → csrf → rate-limit
  → auth → tenant+workspace → membership → permission → validate → HANDLER → envelope
```

Edge **`proxy.ts`** (Next 16's renamed middleware) guards `/dashboard`, `/invoice`,
`/onboarding` at the edge; APIs run the full chain themselves.

### 8 · Security
CSRF (Auth.js tokens for `/api/auth/*` + origin check for `/api/v1/*`) · **rate limiting**
on every auth endpoint (reuses the Mission-3 limiter) · **brute-force lockout**
(`server/auth/brute-force.ts`, pluggable) · secure/`HttpOnly`/`SameSite=Lax` cookies ·
**token rotation** on refresh · session revocation on password reset/change · **audit
logging** (`server/services/audit.service.ts`, non-throwing, **secret-redacting**).

### 9 · Validation
One new `lib/validation/auth.schema.ts` built on the shared `emailSchema`/`roleSchema`
primitives; enforced at the route wrapper **and** re-validated in services (defence in
depth). No duplicated validation.

### 10 · Tests
**41 new** offline tests (unit + integration) — see §4.

---

## 3. Files

**New (`server/auth/`)**: `auth.config.ts`, `index.ts`, `password.ts`, `tokens.ts`,
`permissions.ts`, `rbac.ts`, `brute-force.ts`.
**New repositories**: `user`, `session`, `verification-token`, `membership`, `invitation`,
`audit-log`.
**New services**: `auth.service`, `session.service`, `membership.service`, `audit.service`,
`workspace-bootstrap`.
**New middleware**: `authentication`, `workspace-access`, `permission`, `csrf`,
`client-meta` (+ `defineRoute`/`context` extended).
**New contracts**: `lib/validation/auth.schema.ts`, `lib/dto/auth.dto.ts`,
`types/next-auth.d.ts`.
**New routes**: `app/api/auth/[...nextauth]` + 10 `app/api/v1/auth/*` + 4 membership routes.
**Edge**: `proxy.ts`.
**Schema**: additive `Session` columns + `prisma/migrations/20260704120000_auth_session_registry/`.
**Config**: optional auth vars in `server/config/env.ts` + `.env.example`.
**Deps**: `next-auth`, `@auth/prisma-adapter`, `bcryptjs`.

---

## 4. Test coverage (41 new)

| Suite | Focus |
|-------|-------|
| `rbac.test.ts` | permission matrix vs RBAC.md §4, role hierarchy, `:any`/`:own` (404-hiding), throwing guards |
| `auth-security.test.ts` | bcrypt hash/verify/rehash, token hashing determinism, constant-time compare, 6-digit codes |
| `brute-force.test.ts` | lockout after N, reset on success, auto-release after window, key isolation |
| `auth-schema.test.ts` | password policy, sign-up/in, reset token length, change-password reuse guard, invite-role exclusion |
| `auth-service.test.ts` | **integration**: signup → verify → authenticate, duplicate-email, lockout, forgot→reset (+ session revoke), change-password |
| `membership-service.test.ts` | **integration**: invite (+ no-escalation), accept (email-matched), role change, last-owner protection, transfer-ownership |

Integration tests run fully offline against in-memory repository fakes (`tests/fakes.ts`)
injected through each service's dependency seams — the same pattern that keeps the whole
suite runnable without a live database.

---

## 5. Frozen-frontend guarantee

No file under `app/(site)`, `app/dashboard`, `app/auth`, `app/onboarding`, `app/invoice`,
`components/`, `lib/site-data.ts`, `lib/auth-data.ts`, or any CSS/Tailwind/token file was
touched. The only routing-affecting addition is `proxy.ts`, which performs auth
**redirects** only (listed as a safe change in `UI_FREEZE_NOTES.md`) and renders no markup.
All 57 frozen routes still build.

---

## 6. Going live (needs real credentials — outside this env)

1. Set `AUTH_SECRET`, `AUTH_URL`, and (optionally) `GOOGLE_*` / `GITHUB_*` in `.env`.
2. `npm run db:deploy` applies the init + `auth_session_registry` migrations.
3. `npm run db:seed` (FREE plan enables the first-workspace subscription on verify).
4. Wire a real email provider behind the `AuthService` `deliver` seam (the `EmailMessage`
   model + noop delivery are already in place).

**Deferred (not in the 10-point scope):** 2FA/TOTP enrollment (the `TwoFactorSecret` /
`BackupCode` models and the frozen `/auth/two-factor` page are ready for it), plan-tier
entitlement gating (the second axis in RBAC.md §7), and custom roles.

---

## 7. Verification commands

```bash
npm run typecheck   # 0 errors
npm run build       # exit 0 — 57 frozen routes + /api/auth + /api/v1/{auth,members,...} + Proxy
npm run test        # 70/70 pass (offline)
```

**Authentication & authorization layer is complete and green. Mission 4 done.**
