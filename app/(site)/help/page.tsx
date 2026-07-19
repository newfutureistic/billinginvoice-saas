import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, FileText } from 'lucide-react'
import { Breadcrumbs } from '@/components/site/breadcrumbs'
import { HelpSearch } from '@/components/site/help-search'
import { helpCategories, popularArticles } from '@/lib/site-data'

export const metadata: Metadata = {
  title: 'Help center — Bill Maker',
  description:
    'Guides, answers, and troubleshooting for Bill Maker. Search the knowledge base or browse by topic.',
  alternates: { canonical: '/help' },
}

export default function HelpPage() {
  return (
    <>
      <section className="border-b border-border bg-secondary/30">
        <div className="mx-auto max-w-6xl px-6 py-12 lg:py-16">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Help center' }]} />
          <div className="mx-auto mt-10 max-w-2xl text-center">
            <h1 className="text-balance text-4xl font-semibold tracking-[-0.025em] text-foreground lg:text-5xl">
              How can we help?
            </h1>
            <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
              Search our knowledge base or browse topics below.
            </p>
            <div className="mt-8">
              <HelpSearch />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {helpCategories.map((cat) => {
            const Icon = cat.icon
            return (
              <Link
                key={cat.slug}
                href="#"
                className="group rounded-2xl border border-border bg-card p-7 shadow-token-xs transition-all hover:-translate-y-0.5 hover:shadow-token-md"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-brand-muted text-brand">
                  <Icon className="size-5" />
                </span>
                <h2 className="mt-4 text-lg font-semibold tracking-[-0.01em] text-foreground">
                  {cat.name}
                </h2>
                <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
                  {cat.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand">
                  {cat.articleCount} articles
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="border-t border-border bg-secondary/30">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="text-lg font-semibold tracking-[-0.01em] text-foreground">
            Popular articles
          </h2>
          <ul className="mt-6 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            {popularArticles.map((a) => (
              <li key={a.title}>
                <a
                  href="#"
                  className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-secondary"
                >
                  <FileText className="size-4 shrink-0 text-muted-foreground" />
                  <span className="flex-1 text-sm font-medium text-foreground">{a.title}</span>
                  <span className="hidden text-xs text-muted-foreground sm:block">{a.category}</span>
                  <ArrowRight className="size-4 text-brand" />
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-10 rounded-2xl border border-border bg-card p-8 text-center shadow-token-sm">
            <h3 className="text-lg font-semibold tracking-[-0.01em] text-foreground">
              Still need help?
            </h3>
            <p className="mx-auto mt-2 max-w-md text-pretty leading-relaxed text-muted-foreground">
              Our support team is ready to help with anything the knowledge base doesn&apos;t cover.
            </p>
            <Link
              href="/contact"
              className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-token-sm transition-colors hover:bg-primary/90"
            >
              Contact support
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
