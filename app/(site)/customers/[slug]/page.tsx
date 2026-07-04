import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, Quote } from 'lucide-react'
import { PageHero } from '@/components/site/page-hero'
import { caseStudies, getCaseStudy } from '@/lib/site-data'

export function generateStaticParams() {
  return caseStudies.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const study = getCaseStudy(slug)
  if (!study) return { title: 'Customer story — ToolForge' }
  return {
    title: `${study.company} — ToolForge Customers`,
    description: study.summary,
  }
}

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const study = getCaseStudy(slug)
  if (!study) notFound()

  const others = caseStudies.filter((c) => c.slug !== slug).slice(0, 2)

  return (
    <>
      <PageHero
        eyebrow={study.industry}
        title={study.company}
        description={study.summary}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Customers', href: '/customers' },
          { label: study.company },
        ]}
      />

      <article className="mx-auto max-w-4xl px-6 py-16 lg:py-20">
        <div className="grid grid-cols-3 gap-6 rounded-2xl border border-border bg-card p-8 shadow-token-sm">
          {study.metrics.map((m) => (
            <div key={m.label} className="text-center">
              <p className="text-3xl font-semibold tracking-[-0.02em] text-brand lg:text-4xl">
                {m.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{m.label}</p>
            </div>
          ))}
        </div>

        <figure className="mt-12 border-l-2 border-brand pl-6">
          <Quote className="size-8 text-brand" />
          <blockquote className="mt-4 text-balance text-2xl font-medium leading-relaxed tracking-[-0.01em] text-foreground lg:text-3xl">
            {study.quote}
          </blockquote>
          <figcaption className="mt-6 flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-foreground">
              {study.initials}
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">{study.person}</p>
              <p className="text-sm text-muted-foreground">
                {study.role}, {study.company}
              </p>
            </div>
          </figcaption>
        </figure>

        <div className="mt-12 space-y-5 text-pretty leading-relaxed text-muted-foreground">
          <p>
            When {study.company} started out, paperwork was an afterthought — a patchwork of
            spreadsheets, word processors, and half-remembered email threads. As the {study.industry.toLowerCase()}{' '}
            grew, that patchwork started to cost real time and, occasionally, real money.
          </p>
          <p>
            Switching to ToolForge meant one workspace for invoices, quotes, and contracts — all
            sharing the same branding, client records, and tax logic. The team stopped re-entering
            data and started trusting that every document was correct the first time.
          </p>
          <p>
            Today, {study.company} runs its entire document workflow on ToolForge, freeing the team
            to focus on the work that actually grows the business.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-border bg-secondary/40 p-8 text-center">
          <h2 className="text-xl font-semibold tracking-[-0.01em] text-foreground">
            Start your own story
          </h2>
          <p className="mx-auto mt-2 max-w-md text-pretty leading-relaxed text-muted-foreground">
            Create your first document in seconds. No credit card required.
          </p>
          <Link
            href="/tools/invoice-generator"
            className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-token-sm transition-colors hover:bg-primary/90"
          >
            Try ToolForge free
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </article>

      {others.length > 0 && (
        <section className="border-t border-border bg-secondary/30">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <h2 className="text-lg font-semibold tracking-[-0.01em] text-foreground">
              More customer stories
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {others.map((c) => (
                <Link
                  key={c.slug}
                  href={`/customers/${c.slug}`}
                  className="group rounded-2xl border border-border bg-card p-6 shadow-token-xs transition-all hover:-translate-y-0.5 hover:shadow-token-md"
                >
                  <p className="text-sm font-semibold text-foreground">{c.company}</p>
                  <p className="mt-2 text-pretty leading-relaxed text-muted-foreground">
                    {c.summary}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand">
                    Read story
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
