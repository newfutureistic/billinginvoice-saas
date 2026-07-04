'use client'

import { Fragment, useState } from 'react'
import Link from 'next/link'
import { Check, Minus } from 'lucide-react'
import { plans } from '@/lib/marketing-content'
import { featureGroups } from '@/lib/site-data'
import { cn } from '@/lib/utils'

const annualPrice: Record<string, string> = {
  Free: '$0',
  Pro: '$10',
  Business: '$32',
}

export function PricingPlans() {
  const [annual, setAnnual] = useState(true)

  return (
    <div>
      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-4">
        <span
          className={cn(
            'text-sm font-medium',
            annual ? 'text-muted-foreground' : 'text-foreground',
          )}
        >
          Monthly
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={annual}
          onClick={() => setAnnual((v) => !v)}
          aria-label="Toggle annual billing"
          className={cn(
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
            annual ? 'bg-primary' : 'bg-border-strong',
          )}
        >
          <span
            className={cn(
              'inline-block size-5 transform rounded-full bg-card shadow-token-sm transition-transform',
              annual ? 'translate-x-5' : 'translate-x-0.5',
            )}
          />
        </button>
        <span className="flex items-center gap-2 text-sm font-medium text-foreground">
          Annual
          <span className="rounded-full bg-success-muted px-2 py-0.5 text-xs font-medium text-success">
            Save ~17%
          </span>
        </span>
      </div>

      {/* Plan cards */}
      <div className="mt-12 grid gap-6 lg:grid-cols-3 lg:items-start">
        {plans.map((plan) => {
          const price = annual ? annualPrice[plan.name] : plan.price
          const cadence = plan.name === 'Free' ? plan.cadence : annual ? 'per month, billed yearly' : 'per month'
          return (
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
                  {price}
                </span>
                <span className="text-sm text-muted-foreground">/ {cadence}</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {plan.description}
              </p>
              <Link
                href={plan.name === 'Business' ? '/contact' : '/tools/invoice-generator'}
                className={cn(
                  'mt-6 inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-medium transition-colors',
                  plan.highlighted
                    ? 'bg-primary text-primary-foreground shadow-token-sm hover:bg-primary/90'
                    : 'border border-border bg-card text-foreground hover:bg-muted',
                )}
              >
                {plan.cta}
              </Link>
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

      {/* Comparison table */}
      <div className="mt-20">
        <h2 className="text-center text-2xl font-semibold tracking-[-0.02em] text-foreground lg:text-3xl">
          Compare every feature
        </h2>

        <div className="mt-10 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="py-4 pr-4 text-left font-medium text-muted-foreground">
                  Features
                </th>
                {plans.map((p) => (
                  <th
                    key={p.name}
                    scope="col"
                    className={cn(
                      'px-4 py-4 text-center font-semibold',
                      p.highlighted ? 'text-brand' : 'text-foreground',
                    )}
                  >
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {featureGroups.map((group) => (
                <Fragment key={group.group}>
                  <tr className="bg-secondary/40">
                    <th
                      scope="colgroup"
                      colSpan={4}
                      className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground"
                    >
                      {group.group}
                    </th>
                  </tr>
                  {group.rows.map((row) => (
                    <tr key={row.feature} className="border-b border-border">
                      <td className="py-3.5 pr-4 text-foreground">{row.feature}</td>
                      {(['free', 'pro', 'business'] as const).map((key) => (
                        <td key={key} className="px-4 py-3.5 text-center">
                          <Cell value={row[key]} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function Cell({ value }: { value: string | boolean }) {
  if (value === true)
    return (
      <span className="mx-auto flex size-5 items-center justify-center rounded-full bg-success-muted text-success">
        <Check className="size-3" strokeWidth={3} />
        <span className="sr-only">Included</span>
      </span>
    )
  if (value === false)
    return (
      <span className="mx-auto flex size-5 items-center justify-center text-border-strong">
        <Minus className="size-3.5" />
        <span className="sr-only">Not included</span>
      </span>
    )
  return <span className="text-foreground">{value}</span>
}
