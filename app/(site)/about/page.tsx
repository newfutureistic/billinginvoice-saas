import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { PageHero } from '@/components/site/page-hero'
import { companyValues, timeline } from '@/lib/site-data'

export const metadata: Metadata = {
  title: 'About — Bill Maker',
  description:
    'Bill Maker builds calm, enterprise-grade paperwork tools for freelancers and small teams. Meet the team and our story.',
  alternates: { canonical: '/about' },
}

const stats = [
  { value: 'Free', label: 'To use, no card' },
  { value: 'GST · VAT', label: 'Tax modes built in' },
  { value: '10+', label: 'Currencies supported' },
  { value: 'PDF', label: 'Print-ready export' },
]

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="Paperwork should take seconds, not afternoons"
        description="We started Bill Maker because running a business shouldn't mean fighting your own admin. Our mission is to give every small business enterprise-grade tools that feel effortless."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'About' }]}
      />

      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-6xl grid-cols-2 px-6 lg:grid-cols-4">
          {stats.map((s) => (
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
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-brand">Our values</p>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.02em] text-foreground lg:text-4xl">
              What we believe
            </h2>
          </div>
          <div className="hidden justify-center lg:flex">
            <Image
              src="/about.png"
              alt=""
              aria-hidden
              width={2000}
              height={2000}
              sizes="(min-width: 1024px) 340px, 0px"
              className="h-72 w-72 object-contain"
            />
          </div>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {companyValues.map((v) => {
            const Icon = v.icon
            return (
              <div
                key={v.title}
                className="rounded-2xl border border-border bg-card p-7 shadow-token-xs"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-brand-muted text-brand">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-4 text-lg font-semibold tracking-[-0.01em] text-foreground">
                  {v.title}
                </h3>
                <p className="mt-2 text-pretty leading-relaxed text-muted-foreground">
                  {v.description}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="border-y border-border bg-secondary/30">
        <div className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
          <div className="max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-brand">Our story</p>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.02em] text-foreground lg:text-4xl">
              From one tool to a toolkit
            </h2>
          </div>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {timeline.map((t) => (
              <div key={t.year} className="border-t-2 border-border pt-5">
                <p className="font-mono text-sm font-semibold text-brand">{t.year}</p>
                <h3 className="mt-2 font-semibold tracking-[-0.01em] text-foreground">{t.title}</h3>
                <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
                  {t.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>


      <section className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-16 text-center">
          <h2 className="text-balance text-2xl font-semibold tracking-[-0.02em] text-foreground lg:text-3xl">
            Want to help build the future of business paperwork?
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/contact"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-token-sm transition-colors hover:bg-primary/90"
            >
              Get in touch
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/invoice/new"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-card px-6 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              Create an invoice
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
