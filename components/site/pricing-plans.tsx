import Link from 'next/link'
import { Check } from 'lucide-react'
import { PLANS } from '@/lib/config/plans'
import { cn } from '@/lib/utils'

/**
 * Honest pricing (Phase 1 — Free Access Model). Bill Maker is free today: FREE is the current
 * plan; PRO and BUSINESS are shown as "Coming soon" (kept in the catalogue for the future paid
 * launch). No prices, no Buy / Subscribe / Trial / Contact Sales — nothing misleading.
 */
export function PricingPlans() {
  const order = [PLANS.FREE, PLANS.PRO, PLANS.BUSINESS]
  return (
    <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
      {order.map((plan) => {
        const current = plan.id === 'FREE'
        return (
          <div
            key={plan.id}
            className={cn(
              'relative flex flex-col rounded-2xl border bg-card p-7',
              current ? 'border-brand/30 shadow-token-lg' : 'border-border shadow-token-xs',
            )}
          >
            <span
              className={cn(
                'absolute -top-3 left-7 rounded-full px-3 py-1 text-xs font-medium shadow-token-sm',
                current ? 'bg-brand text-brand-foreground' : 'bg-secondary text-muted-foreground',
              )}
            >
              {current ? 'Current plan' : 'Coming soon'}
            </span>

            <h3 className="text-sm font-semibold uppercase tracking-[0.1em] text-muted-foreground">{plan.name}</h3>
            <p className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-foreground">
              {current ? 'Free' : 'Coming soon'}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {current
                ? 'Everything you need to create, send, and track professional invoices — at no cost.'
                : 'Planned for a future release. Nothing to do today — the free plan stays free.'}
            </p>

            {current ? (
              <Link
                href="/invoice/new"
                className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground shadow-token-sm transition-colors hover:bg-primary/90"
              >
                Start Free
              </Link>
            ) : (
              <span
                aria-disabled="true"
                className="mt-6 inline-flex h-11 cursor-not-allowed items-center justify-center rounded-xl border border-border bg-muted px-5 text-sm font-medium text-muted-foreground"
              >
                Coming soon
              </span>
            )}

            <ul className="mt-7 space-y-3 border-t border-border pt-6">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-foreground">
                  <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-success-muted text-success">
                    <Check className="size-2.5" strokeWidth={3} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}
