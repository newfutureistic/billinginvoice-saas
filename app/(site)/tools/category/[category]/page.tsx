import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { PageHero } from '@/components/site/page-hero'
import { ToolCard } from '@/components/site/tool-card'
import { Cta } from '@/components/marketing/cta'
import { categories, getCategory, toolsByCategory } from '@/lib/site-data'

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>
}): Promise<Metadata> {
  const { category } = await params
  const cat = getCategory(category)
  if (!cat) return { title: 'Category not found — ToolForge' }
  return {
    title: `${cat.name} Tools — ToolForge`,
    description: cat.description,
    alternates: { canonical: `/tools/category/${cat.slug}` },
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const { category } = await params
  const cat = getCategory(category)
  if (!cat) notFound()

  const catTools = toolsByCategory(cat.slug)
  const others = categories.filter((c) => c.slug !== cat.slug)

  return (
    <>
      <PageHero
        eyebrow={`${catTools.length} tools`}
        title={cat.name}
        description={cat.description}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Tools', href: '/tools' },
          { label: cat.name },
        ]}
      />

      <div className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
        {catTools.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-secondary/30 px-6 py-20 text-center">
            <h2 className="text-lg font-semibold text-foreground">No tools here yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We&apos;re building tools for this category. Check back soon.
            </p>
            <Link
              href="/tools"
              className="mt-6 inline-flex h-10 items-center rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Browse all tools
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {catTools.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        )}

        {/* Other categories */}
        <section className="mt-20 border-t border-border pt-12" aria-labelledby="other-cats">
          <h2 id="other-cats" className="text-xl font-semibold tracking-[-0.01em] text-foreground">
            Explore other categories
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {others.map((c) => {
              const Icon = c.icon
              return (
                <Link
                  key={c.slug}
                  href={`/tools/category/${c.slug}`}
                  className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-token-xs transition-all hover:border-border-strong hover:shadow-token-sm"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary/60 text-foreground group-hover:text-brand">
                    <Icon className="size-4" strokeWidth={1.75} />
                  </span>
                  <span className="flex-1 text-sm font-medium text-foreground">{c.name}</span>
                  <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
              )
            })}
          </div>
        </section>
      </div>

      <Cta />
    </>
  )
}
