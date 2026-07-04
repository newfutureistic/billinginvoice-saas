# ToolForge — Authorization & RBAC

> **Design document (no implementation).** Defines roles, permissions, plan
> entitlements, and the enforcement layers.
> Grounded in the frozen UI: the team page (`app/dashboard/team/page.tsx`) renders a
> **Role Permissions matrix** with columns **Admin / Manager / User**, the frozen
> `Team.role` union is `'admin' | 'manager' | 'user'`, and the pricing table gates
> features like *"Roles & permissions"* and *"Audit log"* to the **Business** plan.

---

## 1. Two orthogonal axes of access

A user can do X only if **both** are true. Conflating these is the classic SaaS bug;
we keep them separate.

| Axis | Question | Source | Model |
|------|----------|--------|-------|
| **Permissions (RBAC)** | *Is my role allowed to perform this action?* | `Membership.role` | this doc |
| **Entitlements (Plan)** | *Does this workspace's plan include this capability?* | `Subscription.planTier` → `Plan.entitlements` | §7 |

Example: creating a custom template requires **role** `MANAGER+` (RBAC) **and**
**plan** Pro/Business (entitlement). A Business-plan Viewer still can't create it
(role fails); a Free-plan Owner still can't (plan fails).

---

## 2. Roles

Roles live on **`Membership`** (per-workspace), never on `User` — so one person can be
`OWNER` of "Personal" and `MEMBER` of "Acme Corporation" (exactly what the frozen
`WorkspaceSwitcher` implies).

| Role | Frozen UI label | Purpose |
|------|-----------------|---------|
| `OWNER` | (implicit — creator/billing) | Full control incl. billing, workspace delete, ownership transfer. Exactly **one** per workspace. |
| `ADMIN` | **Admin** | Manage members, settings, all documents; no billing/ownership. |
| `MANAGER` | **Manager** | Create/edit all documents, clients, products, templates; invite `MEMBER`/`VIEWER`. |
| `MEMBER` | **User** | Create/edit **own** documents; read shared data. |
| `VIEWER` | (read-only seat) | Read-only across the workspace. |

The frozen matrix shows three labels (Admin/Manager/User); we add `OWNER` (billing/
ownership, which the UI already separates via the account menu) and `VIEWER` (read-only
seats, useful for accountants/auditors) as forward-compatible extensions. The three
visible labels map to `ADMIN`, `MANAGER`, `MEMBER`.

---

## 3. Permissions

Permissions are `resource:action` strings. Roles map to permission **sets** (a role is
just a named bundle).

```
Resources: workspace, member, billing, document, client, product,
           template, payment, tool, notification, audit, settings
Actions:   create, read, update, delete, send, manage, export, invite
```

Ownership-scoped actions use a suffix: `document:update:any` vs `document:update:own`.

---

## 4. Permission matrix

✔ = allowed · **own** = only records the user created · ✖ = denied

| Permission | OWNER | ADMIN | MANAGER | MEMBER | VIEWER |
|------------|:----:|:----:|:------:|:-----:|:-----:|
| `workspace:read` | ✔ | ✔ | ✔ | ✔ | ✔ |
| `workspace:update` (name, settings) | ✔ | ✔ | ✖ | ✖ | ✖ |
| `workspace:delete` | ✔ | ✖ | ✖ | ✖ | ✖ |
| `billing:manage` (plan, payment method) | ✔ | ✖ | ✖ | ✖ | ✖ |
| `member:read` | ✔ | ✔ | ✔ | ✔ | ✔ |
| `member:invite` | ✔ | ✔ | ✔ (≤ own level) | ✖ | ✖ |
| `member:update` (role/status) | ✔ | ✔ | ✖ | ✖ | ✖ |
| `member:remove` | ✔ | ✔ | ✖ | ✖ | ✖ |
| `document:create` | ✔ | ✔ | ✔ | ✔ | ✖ |
| `document:read` | ✔ | ✔ | ✔ | ✔ (all) | ✔ |
| `document:update` | any | any | any | **own** | ✖ |
| `document:delete` | any | any | any | **own** | ✖ |
| `document:send` | ✔ | ✔ | ✔ | **own** | ✖ |
| `document:export` (PDF) | ✔ | ✔ | ✔ | ✔ | ✔ |
| `client:*` / `product:*` | ✔ | ✔ | ✔ | read + create | read |
| `template:create/update` | ✔ | ✔ | ✔ | ✖ | ✖ |
| `payment:record` | ✔ | ✔ | ✔ | **own docs** | ✖ |
| `tool:run` | ✔ | ✔ | ✔ | ✔ | ✔ (calculators) |
| `audit:read` | ✔ | ✔ | ✖ | ✖ | ✖ |
| `settings:manage` | ✔ | ✔ | ✖ | ✖ | ✖ |

> This table is the source for the frozen **Role Permissions** grid — it renders these
> rows; it does not define new ones.

---

## 5. Authorization enforcement layers (defence in depth)

Authorization is checked at **four** layers; a failure at any one denies the request.

```
1. Edge / Route     — is there a session? (AUTH_FLOW.md §8)   → 401
2. Tenant resolve   — is the user a member of this workspace?  → 403
3. Permission gate  — does the role grant resource:action?     → 403
4. Data scope       — repository injects workspaceId (+ own-filter)  → 404 (not leaked)
```

- **Layer 3 (`withRbac`)** consults a static role→permission map (fast, no DB) —
  `API_ARCHITECTURE.md §7`.
- **Layer 4** is the repository tenant filter (`TenantRepository.scope`) plus, for
  `:own` permissions, a `createdById = ctx.user.id` filter. A `MEMBER` requesting
  another member's invoice gets **404, not 403** — we don't reveal existence across
  the ownership boundary.
- **Field-level:** sensitive response fields (e.g. billing details, other members'
  emails) are stripped in the DTO mapper by role.

```ts
// conceptual guard — used by middleware and inside services
function authorize(ctx: RequestContext, perm: Permission, resource?: Ownable) {
  if (!can(ctx.role, perm)) throw new ForbiddenError(perm)
  if (perm.endsWith(':own') && resource?.createdById !== ctx.user.id)
    throw new NotFoundError()          // hide existence
}
```

Authorization is enforced in the **service layer too**, not only middleware — so
Server Actions and internal callers are equally protected (never trust the transport).

---

## 6. Membership lifecycle & guardrails

Frozen flows: team page "Invite Member", workspace modal "Invite members", role column.

- **Invite** → `Invitation` (email + role + token, expiring). Accepting creates a
  `Membership`. A `MANAGER` may only invite at or below their level (no privilege
  escalation).
- **Role change / removal** → `ADMIN`+; every change writes `AuditLog`
  (`member.role.change`) with before/after.
- **Last-owner protection:** the sole `OWNER` cannot be demoted/removed; ownership must
  be **transferred** first (atomic: promote target to `OWNER`, demote self).
- **Self-service limits:** a member can't change their own role; leaving a workspace is
  allowed unless last owner.
- **Suspended** members (`MemberStatus.SUSPENDED`) keep the row but fail Layer 2 —
  instant, reversible access cut without data loss.

---

## 7. Plan entitlements (the second axis)

Derived directly from the frozen pricing table (`featureGroups` in `lib/site-data.ts`).
Stored as `Plan.entitlements` (JSON) and checked by `billing.service` /
`withEntitlement`.

| Entitlement key | Free | Pro | Business | Frozen pricing row |
|-----------------|------|-----|----------|--------------------|
| `docsPerMonth` | 3 | ∞ | ∞ | "Documents per month" |
| `allTools` | ✖ | ✔ | ✔ | "All 40+ tools" (gates `Tool.minPlan = PRO`) |
| `customBranding` | ✖ | ✔ | ✔ | "Custom branding" |
| `recurringBilling` | ✖ | ✔ | ✔ | "Recurring billing" |
| `seats` | 1 | 3 | 10 | "Team members" |
| `sharedTemplates` | ✖ | ✔ | ✔ | "Shared templates" |
| `approvalWorkflows` | ✖ | ✖ | ✔ | "Approval workflows" |
| `rbacCustomRoles` | ✖ | ✖ | ✔ | "Roles & permissions" |
| `auditLog` | ✖ | ✖ | ✔ | "Audit log" |
| `sso` | ✖ | ✖ | ✔ | "SSO" |

Enforcement points:
- **`docsPerMonth`** — checked in `document.service.create` before numbering; over-limit
  → `PlanLimitError` (frozen UI shows an upgrade prompt via the error `code`).
- **`seats`** — checked on invite/accept.
- **`allTools`** — a `PRO` tool (`Tool.minPlan`) is hidden/denied for Free workspaces.
- **`auditLog` / `sso`** — gate whether the audit UI and SSO login are enabled.

> **Base RBAC (the 5 roles + matrix above) is available on every plan.** The Business
> "Roles & permissions" entitlement unlocks **custom roles** (defining new permission
> bundles beyond the five built-ins) — the built-in roles are always on.

---

## 8. Auditing authorization

Every allow/deny on a sensitive action and every membership/role/billing change is
written to `AuditLog` (`DATABASE_ARCHITECTURE.md §12`) with actor, target, before/after,
IP, and user agent — satisfying the Business-plan "Audit log" promise and giving
incident response a complete trail.

---

## 9. Coverage check

| Mission topic | Section |
|---|---|
| Authorization | §1, §5, §8 |
| RBAC | §2, §3, §4 |
| Workspace Architecture (access side) | §2, §6 |
| Plan gating vs roles | §1, §7 |

**Related:** `AUTH_FLOW.md` (authentication), `API_ARCHITECTURE.md §7` (middleware),
`DATABASE_ARCHITECTURE.md` (`Membership`, `Subscription`, `AuditLog`).
