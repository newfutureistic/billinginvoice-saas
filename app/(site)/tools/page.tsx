import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { PageHero } from '@/components/site/page-hero'
import { ToolCard } from '@/components/site/tool-card'
import { ToolsExplorer } from '@/components/site/tools-explorer'
import { categories, tools, newTools, toolsByCategory } from '@/lib/site-data'
import { Cta } from '@/components/marketing/cta'

export const metadata: Metadata = {
  title: 'All Tools — ToolForge',
  description:
    'Explore 40+ professional tools for invoicing, contracts, finance, and productivity. Search, filter by category, and start free.',
  alternates: { canonical: '/tools' },
}

const featured = tools.filter((t) => t.featured)
const recent = newTools()

export default function ToolsPage() {
  return (
    <>
      <PageHero
        eyebrow="Tool library"
        title="Every tool your business paperwork needs"
        description="40+ professional tools across billing, documents, finance, and productivity — all in one calm, consistent workspace."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Tools' }]}
      />

      <div className="mx-auto max-w-6xl px-6">
        {/* Featured */}
        <section className="py-16 lg:py-20" aria-labelledby="featured-tools-heading">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-brand">
                <Sparkles className="size-3.5" /> Featured
              </p>
              <h2
                id="featured-tools-heading"
                className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-foreground lg:text-3xl"
              >
                Where most teams start
              </h2>
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        </section>

        {/* Categories */}
        <section className="border-t border-border py-16 lg:py-20" aria-labelledby="categories-heading">
          <h2
            id="categories-heading"
            className="text-2xl font-semibold tracking-[-0.02em] text-foreground lg:text-3xl"
          >
            Browse by category
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {categories.map((c) => {
              const Icon = c.icon
              const count = toolsByCategory(c.slug).length
              return (
                <Link
                  key={c.slug}
                  href={`/tools/category/${c.slug}`}
                  className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-6 shadow-token-xs transition-all hover:-translate-y-0.5 hover:border-border-strong hover:shadow-token-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-border bg-secondary/60 text-foreground transition-colors group-hover:border-brand/30 group-hover:bg-brand-muted group-hover:text-brand">
                    <Icon className="size-5" strokeWidth={1.75} />
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-semibold tracking-[-0.01em] text-foreground">
                        {c.name}
                      </h3>
                      <span className="text-xs text-muted-foreground">{count} tools</span>
                    </div>
                    <p className="mt-1.5 text-pretty text-sm leading-relaxed text-muted-foreground">
                      {c.description}
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand">
                      Explore
                      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Explorer */}
        <section className="border-t border-border py-16 lg:py-20" aria-labelledby="all-tools-heading">
          <h2
            id="all-tools-heading"
            className="text-2xl font-semibold tracking-[-0.02em] text-foreground lg:text-3xl"
          >
            All tools
          </h2>
          <p className="mt-3 max-w-2xl text-pretty leading-relaxed text-muted-foreground">
            Search the full library or filter by category to find exactly what you need.
          </p>
          <div className="mt-8">
            <ToolsExplorer />
          </div>
        </section>

        {/* Recently added */}
        <section className="border-t border-border py-16 lg:py-20" aria-labelledby="recent-heading">
          <div className="mb-8">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-brand">Just shipped</p>
            <h2
              id="recent-heading"
              className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-foreground lg:text-3xl"
            >
              Recently added
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recent.slice(0, 3).map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        </section>
      </div>

      <Cta />
    </>
  )
}
