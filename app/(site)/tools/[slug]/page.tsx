import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, Check, Star } from 'lucide-react'
import { PageHero } from '@/components/site/page-hero'
import { ToolCard } from '@/components/site/tool-card'
import {
  tools,
  getTool,
  categoryName,
  relatedTools,
} from '@/lib/site-data'

export function generateStaticParams() {
  return tools.map((t) => ({ slug: t.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const tool = getTool(slug)
  if (!tool) return { title: 'Tool not found — ToolForge' }
  return {
    title: `${tool.name} — ToolForge`,
    description: tool.description,
    alternates: { canonical: `/tools/${tool.slug}` },
  }
}

export default async function ToolDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const tool = getTool(slug)
  if (!tool) notFound()

  const Icon = tool.icon
  const related = relatedTools(tool)

  return (
    <>
      <PageHero
        title={tool.name}
        description={tool.description}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Tools', href: '/tools' },
          { label: categoryName(tool.category), href: `/tools/category/${tool.category}` },
          { label: tool.name },
        ]}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href={`/tools/${tool.slug}`}
            className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-[0.95rem] font-medium text-primary-foreground shadow-token-sm transition-colors hover:bg-primary/90"
          >
            Open {tool.name}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Star className="size-4 text-warning" fill="currentColor" strokeWidth={0} />
              <span className="font-medium text-foreground">{tool.rating.toFixed(1)}</span> rating
            </span>
            <span className="size-1 rounded-full bg-border-strong" aria-hidden />
            <span>
              <span className="font-medium text-foreground">{tool.uses}</span> uses
            </span>
          </div>
        </div>
      </PageHero>

      <div className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
          {/* Main */}
          <div>
            <div className="flex items-center gap-4">
              <span className="flex size-14 items-center justify-center rounded-2xl border border-border bg-brand-muted text-brand">
                <Icon className="size-7" strokeWidth={1.75} />
              </span>
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.16em] text-brand">
                  {categoryName(tool.category)}
                </p>
                <h2 className="mt-1 text-xl font-semibold tracking-[-0.01em] text-foreground">
                  {tool.tagline}
                </h2>
              </div>
            </div>

            {/* How it works */}
            <div className="mt-12">
              <h3 className="text-lg font-semibold tracking-[-0.01em] text-foreground">
                How it works
              </h3>
              <ol className="mt-6 space-y-6">
                {tool.steps.map((step, i) => (
                  <li key={step.title} className="flex gap-4">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                      {i + 1}
                    </span>
                    <div className="pt-0.5">
                      <h4 className="font-medium text-foreground">{step.title}</h4>
                      <p className="mt-1 text-pretty text-sm leading-relaxed text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Sidebar — features */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-border bg-card p-7 shadow-token-sm">
              <h3 className="text-sm font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                What&apos;s included
              </h3>
              <ul className="mt-5 space-y-3">
                {tool.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-foreground">
                    <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-success-muted text-success">
                      <Check className="size-2.5" strokeWidth={3} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={`/tools/${tool.slug}`}
                className="mt-7 inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground shadow-token-sm transition-colors hover:bg-primary/90"
              >
                Start now — it&apos;s free
              </Link>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                No account required to try
              </p>
            </div>
          </aside>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-20 border-t border-border pt-12" aria-labelledby="related-heading">
            <h2
              id="related-heading"
              className="text-xl font-semibold tracking-[-0.01em] text-foreground"
            >
              Related tools
            </h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((t) => (
                <ToolCard key={t.slug} tool={t} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}
