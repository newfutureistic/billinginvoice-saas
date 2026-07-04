# ToolForge — Authentication Flow

> **Design document (no implementation).** Covers the auth stack decision, providers,
> and every flow behind the **6 frozen auth pages** + onboarding gate.
> Frozen pages (from `ROUTE_MAP.md`): `/auth/sign-in`, `/auth/sign-up`,
> `/auth/forgot-password`, `/auth/reset-password`, `/auth/verify-email`,
> `/auth/two-factor`. The UI text lives in `lib/auth-data.ts` and is **not changed** —
> we only wire real logic behind the existing forms.

---

## 1. Decision: Auth.js v5 + Prisma adapter (Supabase = DB, not IdP)

The mission allows *"Auth.js **or** Supabase Auth if better suited."* We choose
**Auth.js (NextAuth v5)** with the **Prisma adapter**, using **Supabase for Postgres +
Storage** only.

### Why Auth.js over Supabase Auth here

| Factor | Auth.js + Prisma (chosen) | Supabase Auth |
|--------|---------------------------|----------------|
| **Schema ownership** | Prisma owns the *entire* schema incl. users — satisfies "Prisma ORM mandatory" and keeps one migration source. | Identity lives in Supabase's `auth` schema, outside Prisma → split ownership, FK friction to our `Membership`/`Workspace`. |
| **Multi-tenant RBAC** | Roles live on `Membership`; authorization is expressive application logic (see `RBAC.md`). | Would push tenant logic into RLS/JWT claims, duplicating authorization in SQL. |
| **Frozen flows fit** | Credentials + OAuth + custom 6-digit verify + TOTP 2FA compose cleanly around Auth.js. | 2FA/verify are opinionated; the frozen 6-digit + backup-code UI needs custom logic anyway. |
| **Portability** | DB provider is swappable; not locked to Supabase's auth. | Tighter coupling to Supabase. |

**Net:** Auth.js gives us one Prisma-owned schema and application-level tenancy that
matches the frozen `WorkspaceSwitcher`/team model. Supabase's value (managed Postgres,
Storage, Realtime) is fully used — just not its auth.

> Supabase Auth + RLS remains a valid alternative and is documented as the fallback if
> the team later wants DB-enforced isolation as the *primary* control. The schema is
> RLS-ready either way (`DATABASE_ARCHITECTURE.md §13`).

### Stack summary
- **Auth.js v5** — session, providers, CSRF, cookie handling.
- **Prisma adapter** — `User`, `Account`, `Session`, `VerificationToken` (see schema).
- **Session strategy:** **database sessions** (`Session` table) — server-side
  revocation, "remember me", and multi-workspace context; cookie holds only the
  session token.
- **Password hashing:** **argon2id** (bcrypt acceptable fallback).
- **2FA:** TOTP (`TwoFactorSecret`) + single-use `BackupCode`s.
- **Providers:** Credentials (email+password), Google, GitHub — all three appear on the
  frozen sign-in/sign-up pages (`lib/auth-data.ts`).

---

## 2. Providers → frozen UI

| Frozen UI element (`lib/auth-data.ts`) | Provider |
|---|---|
| Email + password fields, "Sign in"/"Create account" | Credentials |
| "Continue with Google" | Google OAuth |
| "Continue with GitHub" | GitHub OAuth |
| "Remember me" checkbox | long-lived session cookie |
| 6-digit "Verification code" | email verification (custom, `VerificationToken`) |
| "Authentication code" + "Use backup code" | TOTP 2FA + backup codes |

---

## 3. Sign-up + email verification

Frozen pages: `/auth/sign-up` → `/auth/verify-email`.

```
User submits sign-up form (name, email, password, agree terms)
  → validate (Zod, shared with RHF)
  → check email not taken
  → hash password (argon2id)
  → create User (emailVerified = null)
  → generate 6-digit code → store hashed VerificationToken (identifier=email, 15-min TTL)
  → send EmailKind.VERIFY  (persist EmailMessage)
  → redirect to /auth/verify-email

User enters 6-digit code
  → look up VerificationToken by (email, hash), check not expired
  → set User.emailVerified = now(); delete token
  → create first personal Workspace + OWNER Membership + FREE Subscription
  → start session
  → redirect to /onboarding/welcome   (see §9)
```
- **Rate limits:** max 5 code attempts, resend throttled (30s), code single-use.
- "Resend" (frozen link) issues a fresh token and invalidates the previous.
- OAuth sign-up skips verification (provider-verified email) and jumps to workspace
  creation → onboarding.

---

## 4. Sign-in

Frozen page: `/auth/sign-in`.

```
Credentials submit (email, password, remember?)
  → find User by email
  → verify argon2id hash          (generic error on failure — no user enumeration)
  → if emailVerified == null      → route to /auth/verify-email
  → if 2FA enabled                → issue short-lived pre-auth token → /auth/two-factor
  → else                          → create Session (TTL = remember ? 30d : session)
                                   → resolve last-active workspace → /dashboard
```
- **Account lockout:** exponential backoff / temporary lock after N failed attempts
  (tracked out-of-band); logged to `AuditLog`.
- **OAuth sign-in:** Auth.js links `Account` to `User` by verified email; new users get
  the workspace-creation + onboarding path.

---

## 5. Forgot / reset password

Frozen pages: `/auth/forgot-password` → `/auth/reset-password`.

```
Forgot: submit email
  → ALWAYS respond success (no account enumeration)
  → if user exists: create reset VerificationToken (hashed, 30-min TTL, single-use)
                    send EmailKind.RESET with tokenized link → /auth/reset-password?token=…

Reset: submit new password (+ token)
  → validate token (exists, unexpired, unused)
  → hash new password; update User; delete token
  → revoke all existing Sessions for that user (force re-login)
  → audit 'auth.password.reset'
  → redirect to /auth/sign-in
```

---

## 6. Two-factor authentication

Frozen page: `/auth/two-factor` (authenticator code + "Use backup code").

**Enrollment** (from `/dashboard/settings` → Security):
```
→ generate TOTP secret (encrypted at rest) → show QR (otpauth URI)
→ user confirms a valid 6-digit code → set TwoFactorSecret.enabledAt
→ generate 10 single-use BackupCodes (show once, store hashed)
→ audit 'auth.2fa.enabled'
```

**Verification at sign-in**:
```
Holds a short-lived pre-auth token (from §4), NOT a full session
  → user enters TOTP code  → verify against secret (±1 time step)
     OR "Use backup code"  → match hash, mark BackupCode.usedAt (single use)
  → on success: create full Session → /dashboard
  → on failure: rate-limited retries, audit each attempt
```
Disabling 2FA requires re-authentication and is audited.

---

## 7. Session lifecycle & "remember me"

| Aspect | Design |
|--------|--------|
| Storage | `Session` table (database sessions). Cookie = opaque `sessionToken`, `HttpOnly`, `Secure`, `SameSite=Lax`. |
| Remember me | checked → 30-day expiry; unchecked → browser-session cookie. |
| Active workspace | Resolved per request from `Membership` + a `workspaceId` hint (cookie/header from the frozen `WorkspaceSwitcher`); validated against membership every request. |
| Revocation | Delete `Session` rows to force logout (password reset, "sign out all devices", role change). |
| Logout | `ROUTE_MAP.md` notes `/auth/logout` is currently mock → implemented as a Server Action deleting the session + clearing cookie, redirect to `/`. |
| CSRF | Auth.js built-in tokens on mutations. |

---

## 8. Route protection (edge)

`middleware.ts` maps directly to the frozen route classes in `ROUTE_MAP.md`:

```
Public  (/, (site)/*, /auth/*, /design-system)     → always allow
Protected (/dashboard/*, /invoice/*, /onboarding/*) → require valid session, else → /auth/sign-in
```
No-DB cookie check at the edge; full authorization (membership + RBAC) happens in the
API middleware chain (`API_ARCHITECTURE.md §7`, `RBAC.md`).

---

## 9. Onboarding gate

Frozen onboarding (`/onboarding/welcome…finish`, 7 steps) is where a workspace becomes
usable. Gating logic after first authentication:

```
authenticated?
  ├─ no  → /auth/sign-in
  └─ yes → active workspace has WorkspaceSettings.onboardedAt?
             ├─ no  → /onboarding/welcome   (company → branding → currency → tax → template → finish)
             └─ yes → /dashboard
```
Each onboarding step persists into `WorkspaceSettings` (company, brand color, default
currency, tax region/type, default template — the fields read in
`app/onboarding/*`). `/onboarding/finish` stamps `onboardedAt` and routes to
`/dashboard`.

---

## 10. Security controls summary

- argon2id hashing; secrets/TOTP encrypted at rest; tokens stored **hashed**.
- No user enumeration on sign-in / forgot-password.
- Rate limiting + lockout on auth endpoints; all attempts audited.
- Single-use, short-TTL verification/reset tokens; session revocation on credential
  change.
- 2FA (TOTP + backup codes); OAuth email-verified.
- Every auth event → `AuditLog` (`auth.signin`, `auth.2fa.*`, `auth.password.reset`).

---

## 11. Flow → frozen page map

| Frozen page | Flow section |
|-------------|--------------|
| `/auth/sign-up` | §3 |
| `/auth/verify-email` | §3 |
| `/auth/sign-in` | §4 |
| `/auth/forgot-password` | §5 |
| `/auth/reset-password` | §5 |
| `/auth/two-factor` | §6 |
| `/onboarding/*` | §9 |

**Related:** `RBAC.md` (what an authenticated user may do), `DATABASE_ARCHITECTURE.md`
(identity models), `API_ARCHITECTURE.md §7` (middleware).
