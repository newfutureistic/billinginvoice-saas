import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Breadcrumbs } from '@/components/site/breadcrumbs'
import { blogPosts, getPost, relatedPosts } from '@/lib/site-data'

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) return { title: 'Article — ToolForge' }
  return { title: `${post.title} — ToolForge Blog`, description: post.excerpt }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()

  const related = relatedPosts(post, 3)

  return (
    <>
      <div className="border-b border-border bg-secondary/30">
        <div className="mx-auto max-w-3xl px-6 py-12 lg:py-16">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Blog', href: '/blog' },
              { label: post.title },
            ]}
          />
          <span className="mt-8 inline-flex items-center rounded-full bg-brand-muted px-2.5 py-1 text-xs font-medium text-brand">
            {post.category}
          </span>
          <h1 className="mt-4 text-balance text-4xl font-semibold tracking-[-0.025em] text-foreground lg:text-5xl">
            {post.title}
          </h1>
          <div className="mt-6 flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-foreground">
              {post.author.initials}
            </span>
            <div className="text-sm">
              <p className="font-semibold text-foreground">{post.author.name}</p>
              <p className="text-muted-foreground">
                {formatDate(post.date)} · {post.readingTime} min read
              </p>
            </div>
          </div>
        </div>
      </div>

      <article className="mx-auto max-w-3xl px-6 py-14 lg:py-16">
        <p className="text-pretty text-xl leading-relaxed text-foreground">{post.excerpt}</p>
        <div className="mt-8 space-y-8">
          {post.content.map((block, i) => (
            <section key={i} className="space-y-4">
              {block.heading && (
                <h2 className="text-2xl font-semibold tracking-[-0.01em] text-foreground">
                  {block.heading}
                </h2>
              )}
              {block.paragraphs.map((p, j) => (
                <p key={j} className="text-pretty leading-relaxed text-muted-foreground">
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            All articles
          </Link>
          <Link
            href="/tools/invoice-generator"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-token-sm transition-colors hover:bg-primary/90"
          >
            Try ToolForge free
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </article>

      {related.length > 0 && (
        <section className="border-t border-border bg-secondary/30">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <h2 className="text-lg font-semibold tracking-[-0.01em] text-foreground">
              Keep reading
            </h2>
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="group flex flex-col rounded-2xl border border-border bg-card p-6 shadow-token-xs transition-all hover:-translate-y-0.5 hover:shadow-token-md"
                >
                  <span className="text-xs font-medium uppercase tracking-[0.08em] text-brand">
                    {p.category}
                  </span>
                  <h3 className="mt-2 text-pretty font-semibold leading-snug tracking-[-0.01em] text-foreground">
                    {p.title}
                  </h3>
                  <span className="mt-auto pt-4 text-xs text-muted-foreground">
                    {p.readingTime} min read
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
