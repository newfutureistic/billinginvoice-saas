import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Quote } from 'lucide-react'
import { PageHero } from '@/components/site/page-hero'
import { Newsletter } from '@/components/site/newsletter'
import { caseStudies } from '@/lib/site-data'

export const metadata: Metadata = {
  title: 'Customers — ToolForge',
  description:
    'See how design studios, consultancies, and growing retailers run their business paperwork on ToolForge.',
}

const overallStats = [
  { value: '50,000+', label: 'Businesses' },
  { value: '$2.4B', label: 'Invoiced' },
  { value: '4.9/5', label: 'Average rating' },
  { value: '30+', label: 'Countries' },
]

export default function CustomersPage() {
  return (
    <>
      <PageHero
        eyebrow="Customers"
        title="Businesses that ship paperwork in seconds"
        description="From solo founders to five-person finance teams, thousands of businesses trust ToolForge to invoice, quote, and get paid."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Customers' }]}
      />

      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px overflow-hidden px-6 lg:grid-cols-4">
          {overallStats.map((s) => (
            <div key={s.label} className="px-2 py-8 text-center">
              <p className="text-3xl font-semibold tracking-[-0.02em] text-foreground lg:text-4xl">
                {s.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
        <div className="grid gap-6 lg:grid-cols-3">
          {caseStudies.map((c, i) => (
            <Link
              key={c.slug}
              href={`/customers/${c.slug}`}
              className={`group flex flex-col rounded-2xl border border-border bg-card p-7 shadow-token-xs transition-all hover:-translate-y-0.5 hover:shadow-token-md ${
                i === 0 ? 'lg:col-span-3 lg:flex-row lg:items-center lg:gap-10 lg:p-10' : ''
              }`}
            >
              <div className={i === 0 ? 'lg:flex-1' : ''}>
                <Quote className="size-8 text-brand" />
                <p
                  className={`mt-4 text-pretty font-medium leading-relaxed text-foreground ${
                    i === 0 ? 'text-xl lg:text-2xl' : 'text-base'
                  }`}
                >
                  {c.quote}
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-foreground">
                    {c.initials}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{c.person}</p>
                    <p className="text-sm text-muted-foreground">
                      {c.role}, {c.company}
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`mt-6 grid grid-cols-3 gap-4 border-t border-border pt-6 lg:mt-0 lg:border-t-0 ${
                  i === 0 ? 'lg:w-80 lg:border-l lg:pl-10 lg:pt-0' : ''
                }`}
              >
                {c.metrics.map((m) => (
                  <div key={m.label}>
                    <p className="text-xl font-semibold tracking-[-0.02em] text-foreground">
                      {m.value}
                    </p>
                    <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{m.label}</p>
                  </div>
                ))}
              </div>

              {i !== 0 && (
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-brand">
                  Read story
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              )}
            </Link>
          ))}
        </div>
      </section>

      <Newsletter />
    </>
  )
}
