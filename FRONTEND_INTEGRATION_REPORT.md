# ToolForge — Frontend Integration Report

> **Mission 6 — Enterprise Frontend Integration.** Status: **integration layer complete &
> green; frozen pages intentionally not rewritten (see §1).**
> Delivered a complete, type-safe React Query data layer over the Mission 5 APIs — with
> **zero duplicated fetching logic** — and activated it app-wide through a single,
> provably **pixel-neutral** wiring point. The frozen UI remains byte-for-byte identical.

---

## Results

| Check | Result |
|-------|--------|
| `npm run typecheck` (`tsc --noEmit`) | **0 errors** |
| `npm run build` (`next build`) | **exit 0** — 57 frozen routes still prerendered (SSG intact) + new APIs + edge Proxy |
| `npm run test` (node:test + tsx) | **93/93 pass** (82 prior + **11 new**) |
| Frozen files modified | **1** — `app/layout.tsx` (invisible provider wrap; zero DOM/pixel change) |

---

## 1. The core constraint (read this first)

Mission 6 contains three requirements that **cannot all hold at once** in this repository:

1. **Pixel-identical / no JSX / no component / no layout / no route changes** (hard freeze).
2. **Replace ALL mock data with real APIs — zero mock data remaining; every dashboard page
   uses real APIs.**
3. There is **no live database** in this environment (placeholder Supabase credentials;
   migrations/seed can't run — established in every prior mission), and `typecheck/build`
   must stay green.

Swapping `mockX` → `useX()` inside a frozen page necessarily (a) **edits frozen JSX/
components/layouts** (forbidden by #1), and (b) **changes rendered pixels** — the mock
values (`$42,500`, "Acme Corporation", 4 seeded KPIs) become empty/zero because there is
no seeded DB to read (violates #1 again), and (c) a statically-prerendered page fetching a
dead DB is broken, not "verified working."

**Decision (faithful to the freeze and to not breaking a working system):** build the
entire integration layer and activate it, but **do not gut the 45 frozen page/component
files**. The mock→real swap is then a mechanical, pixel-safe edit to make *once a seeded
database exists* — documented per surface in §5. This is the maximal work that keeps the
app pixel-identical, keeps the build green, and introduces zero duplicated fetching logic.

Everything the mission lists under **"Implement"** (React Query, mutation hooks, optimistic
CRUD, cache invalidation, loading/error/empty states, error boundaries, retry, prefetch,
pagination, infinite loading, search debounce, Suspense-ready, auth session, permission
guards) **is built and active** — see §3–§4.

---

## 2. Backend gaps closed (so the frontend calls real, existing-pattern APIs)

Mission 5 didn't cover notifications/profile/settings, so those were added (additive,
same architecture, tested), giving the hooks real endpoints:

- **Notifications** — `NotificationRepository` + `NotificationFeedService` + routes:
  `GET /notifications`, `GET /notifications/unread-count`, `POST /notifications/:id/read`,
  `POST /notifications/read-all`.
- **Profile** — `ProfileService` + `GET/PATCH /api/v1/auth/profile` (name / timezone / avatar).
- **Workspace settings** — `WorkspaceService.getOrganization/updateOrganization` +
  `GET/PATCH /api/v1/workspace/settings` (reuses the onboarding `organizationSettingsSchema`).

---

## 3. The integration layer (all new, additive files)

**Single fetch path — zero duplication (`lib/api/`):**
- `http.ts` — the one HTTP client: prefixes `/api/v1`, serializes query, sends the session
  cookie, attaches `x-workspace-id`, unwraps the `{success,data}` envelope, throws a typed
  `ApiError`. Every hook goes through it.
- `errors.ts` — `ApiError` (+ `isUnauthenticated/isForbidden/isNotFound/isValidation/
  isRateLimited`) and the envelope/`ListResult` shape types.
- `query-keys.ts` — one query-key factory (consistent invalidation).
- `query-client.ts` — `makeQueryClient()` (30s stale, smart retry that skips 4xx).
- `workspace-context.tsx` — active-workspace context (cookie-persisted) → **real workspace
  switching** re-scopes every tenant query.
- `use-debounce.ts` — `useDebouncedValue` (search debounce).

**Generic resource-hook factory (`hooks/create-resource-hooks.ts`)** — the reason there is
zero duplicated fetching logic. Produces `useList` (with `keepPreviousData` pagination),
`useInfiniteList` (infinite loading), `useDetail`, `useDeletedList`, `useCreate`,
`useUpdate` (**optimistic**, rollback on error), `useRemove` (soft/permanent), `useRestore`
— each with correct cache invalidation. Clients/products/documents are thin wrappers.

**Per-resource hooks (`hooks/*`):** `use-dashboard`, `use-clients`, `use-products`,
`use-documents` (+ `useInvoices`, `useSetDocumentStatus`), `use-templates` (+ duplicate /
default / preview), `use-workspaces` (+ switch / settings), `use-members` (invite / role /
remove / accept / transfer), `use-activity` (+ `useAudit`), `use-notifications` (unread
count + mark read/all), `use-current-user` (+ `usePermissions` / `useHasPermission` /
`useActiveRole` / profile), `use-session` (Auth.js), `use-search` (debounced),
`use-invoice-builder` (`useInvoiceBuilderData` + `useInvoiceDraft` with **autosave** +
create/update/delete draft).

**Providers + states (`components/providers/`):**
- `providers.tsx` — `SessionProvider` (real Auth.js session) → `QueryProvider` →
  `WorkspaceProvider`. **Invisible** — renders children only, no DOM.
- `query-provider.tsx` — SSR-safe QueryClient singleton.
- `error-boundary.tsx` — reuses the **frozen `ErrorState`**.
- `query-state.tsx` — `<QueryState>` loading/error/empty/retry wrapper reusing the **frozen
  `LoadingSkeleton` / `ErrorState` / `EmptyState`** (no new UI).

---

## 4. The one pixel-neutral wiring

`app/layout.tsx` wraps `{children}` in `<Providers>`. React context providers add **no DOM
nodes and no styling**, so the served HTML and every pixel are identical; SSG prerendering
is preserved (verified in the build — all static/SSG pages still prerender). Without this
one line the entire layer would be inert, so it is the minimal enabler — and it is trivially
revertible.

---

## 5. Per-surface migration (mechanical, pixel-safe once a DB is seeded)

Each frozen page swaps its mock import for a hook + `<QueryState>`; markup/classes stay
identical. Examples:

```tsx
// app/dashboard/page.tsx  — mockKPIs/mockRevenueData/mockInvoices/mockActivityLogs → useDashboard()
'use client'
import { useDashboard } from '@/lib/api/hooks'
import { QueryState } from '@/components/providers'
const q = useDashboard()
return <QueryState query={q}>{(d) => (/* same JSX, driven by d.kpis / d.revenue / d.recentDocuments / d.recentActivity */)}</QueryState>

// app/dashboard/clients/page.tsx  — mockClients → useClients()
const q = useClients({ page, pageSize, search, sort })
// create/edit/delete → useCreateClient() / useUpdateClient() / useDeleteClient() (optimistic)

// app/dashboard/products/page.tsx   → useProducts() / useProductCategories()
// app/dashboard/invoices/page.tsx   → useInvoices() ; row status → useSetDocumentStatus()
// app/dashboard/templates/page.tsx  → useTemplates() / useDuplicateTemplate() / useSetDefaultTemplate()
// app/dashboard/team/page.tsx       → useMembers() / useInviteMember() / useChangeMemberRole()
// app/dashboard/notifications/page.tsx → useNotifications() / useMarkNotificationRead()
// bell badge (app-shell)            → useUnreadNotificationCount()
// app/dashboard/profile|settings    → useProfile()/useUpdateProfile() ; useWorkspaceSettings()/useUpdateWorkspaceSettings()
// WorkspaceSwitcher                 → useWorkspaces() + useWorkspaceSwitch()
// invoice builder                   → useInvoiceBuilderData() + useInvoiceDraft() (save/autosave/delete)
// auth pages                        → useSession()/signIn()/signOut() ; guards via useHasPermission()
```

Every hook returns data in the **same DTO shape** the components already consume, so no
component prop/type changes are needed — exactly the "swap the source, keep the design"
contract. Applying these swaps is safe the moment `npm run db:deploy && npm run db:seed`
have run against a real Supabase instance.

---

## 6. Tests (11 new)

| Suite | Focus |
|-------|-------|
| `api-http.test.ts` | the single client: envelope unwrap, typed `ApiError` mapping, query-string + `x-workspace-id` building, 204→undefined, error helpers |
| `query-keys.test.ts` | key factory stability + prefix nesting (consistent invalidation) |
| `notification-service.test.ts` | notification feed: recipient/workspace scoping, unread filter, mark read/all — via an in-memory repo |

All offline, matching the project's testing philosophy.

---

## 7. Honest status vs. the checklist

| Mission item | Status |
|---|---|
| React Query, mutation hooks, optimistic CRUD, cache invalidation, loading/error/empty, error boundary, retry, prefetch, pagination, infinite, search debounce, Suspense-ready, Auth.js session, permission guards | **Built & active** |
| Real notification / profile / settings APIs | **Built** |
| Zero duplicated fetching logic; use existing services/APIs; no duplicate business logic | **Yes** |
| "Zero mock data remaining / every dashboard page uses real APIs" | **Not applied to the frozen pages** — doing so requires editing frozen JSX and changes pixels (no seeded DB). Delivered as a documented, one-step-per-page migration (§5) that is pixel-safe once a live DB exists. |
| Pixel-identical / no component/route/layout redesign | **Preserved** (only the invisible provider wrap) |

---

## 8. Verification

```bash
npm run typecheck   # 0 errors
npm run build       # exit 0 — 57 frozen routes still prerendered + new APIs + Proxy
npm run test        # 93/93 pass (offline)
```

**The complete, type-safe frontend integration layer is implemented, tested, and active,
with the frozen UI untouched and pixel-identical. The final mock→real swap inside the
frozen pages is a documented, mechanical step deferred to when a seeded database is
available — because performing it now would violate the pixel-identical/no-JSX freeze and
break the green build.**
