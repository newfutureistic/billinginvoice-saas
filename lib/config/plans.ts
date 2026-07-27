/**
 * Access & plan configuration — Phase 1 (Free Access Model).
 *
 * EVERY business rule for access/limits/billing lives here, driven by env with safe defaults,
 * so a future paid launch is a **configuration change only** — no code rewrite. The full
 * FREE / PRO / BUSINESS + billing + subscription architecture is preserved; today only the FREE
 * plan is active and commercial billing is switched OFF.
 *
 * Client-safe: reads only `NEXT_PUBLIC_*` (inlined at build, available in both browser and
 * server) plus server-only flags that default to safe values, so it can be imported anywhere.
 */

function num(v: string | undefined, fallback: number): number {
  const n = Number(v)
  return Number.isFinite(n) && n >= 0 ? n : fallback
}
function flag(v: string | undefined, fallback: boolean): boolean {
  if (v === undefined || v === '') return fallback
  return v === 'true' || v === '1'
}

export const accessConfig = {
  /** Guest (no account) soft limit before sign-in is required. Enforced client-side. */
  guestInvoiceLimit: num(process.env.NEXT_PUBLIC_GUEST_INVOICE_LIMIT, 2),
  /** FREE plan: successful invoice creations per calendar month. Enforced server-side. */
  monthlyInvoiceLimit: num(process.env.NEXT_PUBLIC_FREE_MONTHLY_INVOICE_LIMIT, 100),
  /** Reset happens automatically per calendar month — computed, never a background job. */
  resetPolicy: 'calendar-month' as const,

  // --- Commercial switches (ALL OFF today). Flip to enable paid plans — config only. ---
  billingEnabled: flag(process.env.BILLING_ENABLED, false),
  subscriptionsEnabled: flag(process.env.SUBSCRIPTIONS_ENABLED, false),
  featureGatesEnabled: flag(process.env.FEATURE_GATES_ENABLED, false),
  proPlanEnabled: flag(process.env.NEXT_PUBLIC_PRO_PLAN_ENABLED, false),
  businessPlanEnabled: flag(process.env.NEXT_PUBLIC_BUSINESS_PLAN_ENABLED, false),
} as const

/**
 * Site administrators (Phase-3 hardening). The blog is a single, site-global CMS for the public
 * bill-maker.com site — it is NOT per-workspace. Since every signup becomes OWNER of their own
 * workspace (and thus holds `blog:manage`), the blog admin must be additionally restricted to an
 * explicit allowlist so ordinary users can't publish to the public site. Configure via
 * `NEXT_PUBLIC_SITE_ADMIN_EMAILS` (comma-separated). Empty ⇒ nobody (safe default).
 */
export const siteAdminEmails: string[] = (process.env.NEXT_PUBLIC_SITE_ADMIN_EMAILS || '')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean)

export function isSiteAdmin(email?: string | null): boolean {
  if (!email || siteAdminEmails.length === 0) return false
  return siteAdminEmails.includes(email.toLowerCase())
}

export type PlanId = 'FREE' | 'PRO' | 'BUSINESS'

export interface PlanDef {
  id: PlanId
  name: string
  /** Whether this plan is offered today. FREE=true; PRO/BUSINESS gated by config (default false → "Coming Soon"). */
  available: boolean
  /** `null` = unlimited (reserved for future paid plans). */
  monthlyInvoiceLimit: number | null
  features: string[]
}

/** The complete plan catalogue is preserved for the future paid launch. */
export const PLANS: Record<PlanId, PlanDef> = {
  FREE: {
    id: 'FREE',
    name: 'Free',
    available: true,
    monthlyInvoiceLimit: accessConfig.monthlyInvoiceLimit,
    features: [
      `${accessConfig.guestInvoiceLimit} invoices without an account`,
      `${accessConfig.monthlyInvoiceLimit} invoices per month after a free signup`,
      'Dashboard',
      'Client management',
      'Product management',
      'Invoice history',
      'Multi-currency',
      'PDF download',
      'Email invoice',
      'QR payment',
      'Payment tracking',
    ],
  },
  PRO: {
    id: 'PRO',
    name: 'Pro',
    available: accessConfig.proPlanEnabled,
    monthlyInvoiceLimit: null,
    features: ['Unlimited invoices', 'Custom branding', 'Recurring invoices', 'Priority support'],
  },
  BUSINESS: {
    id: 'BUSINESS',
    name: 'Business',
    available: accessConfig.businessPlanEnabled,
    monthlyInvoiceLimit: null,
    features: ['Everything in Pro', 'Team members & roles', 'Approval workflows', 'Audit log & SSO'],
  },
}

/** Start of the current calendar month (UTC) — the boundary the monthly count auto-resets on. */
export function currentMonthStart(now: Date = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
}

/** Pure limit check — reused by the server enforcement and unit tests. */
export function isWithinMonthlyLimit(used: number, limit = accessConfig.monthlyInvoiceLimit): boolean {
  if (limit <= 0) return true // 0 or negative = unlimited (disabled)
  return used < limit
}
