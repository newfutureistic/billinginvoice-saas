import { Check } from 'lucide-react'
import { plans } from '@/lib/marketing-content'
import { cn } from '@/lib/utils'

export function PricingPreview() {
  return (
    <section id="pricing" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20 lg:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-brand">Pricing</p>
        <h2 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.02em] text-foreground lg:text-4xl">
          Start free. Upgrade when it pays for itself
        </h2>
        <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
          Simple, transparent plans. No hidden fees, no per-invoice charges.
        </p>
      </div>

      <div className="mt-14 grid gap-6 lg:grid-cols-3 lg:items-start">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={cn(
              'relative flex flex-col rounded-2xl border bg-card p-7 transition-all',
              plan.highlighted
                ? 'border-brand/30 shadow-token-lg lg:-mt-4 lg:pb-9 lg:pt-9'
                : 'border-border shadow-token-xs',
            )}
          >
            {plan.highlighted && (
              <span className="absolute -top-3 left-7 rounded-full bg-brand px-3 py-1 text-xs font-medium text-brand-foreground shadow-token-sm">
                Most popular
              </span>
            )}
            <h3 className="text-sm font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              {plan.name}
            </h3>
            <div className="mt-4 flex items-baseline gap-1.5">
              <span className="text-4xl font-semibold tracking-[-0.02em] text-foreground">
                {plan.price}
              </span>
              <span className="text-sm text-muted-foreground">/ {plan.cadence}</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{plan.description}</p>

            <a
              href="/tools/invoice-generator"
              className={cn(
                'mt-6 inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-medium transition-colors',
                plan.highlighted
                  ? 'bg-primary text-primary-foreground shadow-token-sm hover:bg-primary/90'
                  : 'border border-border bg-card text-foreground hover:bg-muted',
              )}
            >
              {plan.cta}
            </a>

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
        ))}
      </div>
    </section>
  )
}
