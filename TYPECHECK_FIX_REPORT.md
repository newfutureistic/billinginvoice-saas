# ToolForge — Typecheck Fix Report

> Approved scope: **fix only the existing TypeScript errors** with minimal, type-only
> changes. No UI, layout, styling, routes, spacing, typography, animation, or business
> logic changes. Rendered UI is byte-for-byte identical.

---

## Result

| Check | Before | After |
|-------|--------|-------|
| `npm run typecheck` (`tsc --noEmit`) | **7 errors** | **0 errors** ✅ (exit 0) |
| `npm run build` (`next build`) | exit 0 (errors hidden by `ignoreBuildErrors`) | **exit 0** ✅ — all 57 routes prerendered |

All 7 errors were pre-existing, in frozen frontend files, and surfaced only once a
`typecheck` script was added (they were masked by `next.config.mjs` →
`typescript.ignoreBuildErrors: true`). None were in the database foundation.

---

## Fixes applied (6 files, all type-only)

| # | File:line | Error | Fix | Why UI/output is unchanged |
|---|-----------|-------|-----|----------------------------|
| 1 | [lib/hooks/use-invoice.ts:20](lib/hooks/use-invoice.ts#L20) | `useRef<NodeJS.Timeout>()` — Expected 1 argument (React 19 `@types/react` requires an initial value) | `useRef<NodeJS.Timeout \| undefined>(undefined)` | `useRef()` already initialized `.current` to `undefined` at runtime; explicitly passing `undefined` is identical. `clearTimeout(undefined)` and later assignment both remain valid. |
| 2 | [app/dashboard/team/page.tsx:40](app/dashboard/team/page.tsx#L40) | `'unknown' not assignable to 'string'` | `status={value as string}` | Type assertion only; the runtime cell value is already the role/status string. Rendered output identical. |
| 3 | [app/dashboard/team/page.tsx:45](app/dashboard/team/page.tsx#L45) | same | `status={value as string}` | same |
| 4 | [app/dashboard/clients/page.tsx:50](app/dashboard/clients/page.tsx#L50) | same | `status={value as string}` | same |
| 5 | [app/dashboard/clients/[id]/page.tsx:98](app/dashboard/clients/[id]/page.tsx#L98) | same | `status={value as string}` | same |
| 6 | [app/dashboard/invoices/page.tsx:49](app/dashboard/invoices/page.tsx#L49) | same | `status={value as string}` | same |
| 7 | [app/page.tsx:32](app/page.tsx#L32) | `'canonical' does not exist in type 'Metadata'` | removed the inert `canonical` line | See note below. |

**Files touched:** `lib/hooks/use-invoice.ts`, `app/page.tsx`,
`app/dashboard/team/page.tsx`, `app/dashboard/clients/page.tsx`,
`app/dashboard/clients/[id]/page.tsx`, `app/dashboard/invoices/page.tsx`.
Only type annotations / assertions / one inert property were changed — **no JSX
structure, class names, styles, text, or logic.**

### Why the DataTable errors were fixed at the call site
The mismatch is between the shared component's `DataTable` column signature
(`render?: (value: unknown, …)`) and `StatusBadge`'s `status: string` prop
([components/dashboard/dashboard-cards.tsx](components/dashboard/dashboard-cards.tsx)).
Fixing it with a per-call `as string` assertion:
- keeps the shared component's stricter `unknown` contract intact (no widening to
  `any` that would weaken every other table),
- is provably runtime-neutral (the value passed for the `status`/`role` columns is
  already a string),
- touches exactly the error sites and nothing else.

The sibling `render: (value) => \`$${value}\`` columns were **not** errors (template
literals accept `unknown`) and were left untouched.

### Note on `canonical` (app/page.tsx)
`canonical` was set at the **top level** of the `Metadata` object, which is not a valid
`Metadata` field in Next 16 — so Next **ignored it at runtime and emitted no canonical
link.** To keep the served HTML byte-for-byte identical (and current behavior
unchanged), the inert property was **removed**.

- The semantically correct home for it is `alternates: { canonical: 'https://toolforge.app' }`.
  That was deliberately **not** used here because it would *add* a
  `<link rel="canonical">` tag to `<head>` that is not emitted today — i.e. it would
  change the output, violating the byte-for-byte requirement.
- If enabling the canonical link is desired, that is a one-line, intentional SEO change
  (`alternates.canonical`) to make separately.

---

## Verification

```
npm run typecheck   →  exit 0, no errors
npm run build       →  exit 0, all 57 routes prerendered (Static / SSG / Dynamic)
```

- **Visible UI:** unchanged — every fix is a type annotation/assertion or an inert,
  never-rendered metadata property. No component markup, styling, spacing, typography,
  layout, animation, or route was modified.
- **Business logic:** unchanged — no control flow, calculations, or data handling were
  altered.
- **Database foundation:** unaffected — still 0 type errors.

**Done. Stopping and awaiting your next instruction.**
