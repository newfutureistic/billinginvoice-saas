import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight, Clock } from 'lucide-react'
import { Breadcrumbs } from '@/components/site/breadcrumbs'
import { Newsletter } from '@/components/site/newsletter'
import { JsonLd } from '@/components/seo/json-ld'
import { BlogService } from '@/server/services/blog.service'
import { renderMarkdown } from '@/lib/blog-markdown'
import { buildMetadata, articleSchema, breadcrumbSchema, absoluteUrl } from '@/lib/seo'

// ISR: cache each article and revalidate periodically. This serves published posts from the
// edge/cache instead of hitting the database on every request — far less DB load, faster, and
// resilient to a brief database blip (a cached article keeps serving). New/updated posts appear
// within the revalidate window.
export const revalidate = 600

function fmt(iso: string | null) {
  return iso ? new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const data = await new BlogService().getPublished(slug).catch(() => null)
  if (!data) return { title: 'Article' }
  const { post } = data
  const meta = buildMetadata({
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt || `Read “${post.title}” on the Bill Maker blog.`,
    path: `/blog/${post.slug}`,
    type: 'article',
    keywords: post.tags,
  })
  if (post.canonicalUrl) meta.alternates = { canonical: post.canonicalUrl }
  if (post.coverImage && meta.openGraph) meta.openGraph.images = [{ url: post.coverImage, alt: post.coverAlt || post.title }]
  return meta
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await new BlogService().getPublished(slug)
  if (!data) notFound()
  const { post, related, prev, next } = data
  const html = renderMarkdown(post.content)
  const shareUrl = absoluteUrl(`/blog/${post.slug}`)

  return (
    <>
      <JsonLd
        data={articleSchema({
          title: post.title,
          description: post.metaDescription || post.excerpt || post.title,
          path: `/blog/${post.slug}`,
          datePublished: post.publishedAt || post.createdAt,
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Blog', path: '/blog' },
          { name: post.title, path: `/blog/${post.slug}` },
        ])}
      />

      <div className="border-b border-border bg-secondary/30">
        <div className="mx-auto max-w-3xl px-6 py-12 lg:py-16">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Blog', href: '/blog' }, { label: post.title }]} />
          <p className="mt-8 text-xs font-medium uppercase tracking-wide text-brand">{post.category}</p>
          <h1 className="mt-3 text-balance text-4xl font-semibold tracking-[-0.025em] text-foreground lg:text-5xl">
            {post.title}
          </h1>
          {post.excerpt && <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">{post.excerpt}</p>}
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{post.authorName}</span>
            <span aria-hidden>·</span>
            <span>{fmt(post.publishedAt)}</span>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1"><Clock className="size-3.5" /> {post.readingMinutes} min read</span>
          </div>
        </div>
      </div>

      <article className="mx-auto max-w-3xl px-6 py-14">
        {post.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.coverImage} alt={post.coverAlt || post.title} className="mb-10 w-full rounded-2xl border border-border object-cover" />
        )}
        <div className="blog-content" dangerouslySetInnerHTML={{ __html: html }} />

        {post.tags.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2">
            {post.tags.map((t) => (
              <Link key={t} href={`/blog?tag=${encodeURIComponent(t)}`} className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground hover:text-foreground">
                #{t}
              </Link>
            ))}
          </div>
        )}

        <div className="mt-10 flex items-center gap-3 border-t border-border pt-6">
          <span className="text-sm font-medium text-foreground">Share:</span>
          <a className="text-sm text-brand hover:underline" target="_blank" rel="noopener" href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(shareUrl)}`}>X</a>
          <a className="text-sm text-brand hover:underline" target="_blank" rel="noopener" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}>LinkedIn</a>
          <a className="text-sm text-brand hover:underline" target="_blank" rel="noopener" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}>Facebook</a>
        </div>

        {(prev || next) && (
          <nav className="mt-10 grid gap-4 sm:grid-cols-2" aria-label="More articles">
            {prev ? (
              <Link href={`/blog/${prev.slug}`} className="rounded-xl border border-border bg-card p-5 transition-colors hover:bg-muted">
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><ArrowLeft className="size-3" /> Previous</span>
                <p className="mt-1 font-medium text-foreground">{prev.title}</p>
              </Link>
            ) : <span />}
            {next && (
              <Link href={`/blog/${next.slug}`} className="rounded-xl border border-border bg-card p-5 text-right transition-colors hover:bg-muted">
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">Next <ArrowRight className="size-3" /></span>
                <p className="mt-1 font-medium text-foreground">{next.title}</p>
              </Link>
            )}
          </nav>
        )}
      </article>

      {related.length > 0 && (
        <section className="border-t border-border bg-secondary/30">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <h2 className="text-2xl font-semibold tracking-[-0.02em] text-foreground">Related articles</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              {related.map((r) => (
                <Link key={r.id} href={`/blog/${r.slug}`} className="group rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-token-md">
                  <p className="text-xs font-medium uppercase tracking-wide text-brand">{r.category}</p>
                  <h3 className="mt-2 text-pretty font-semibold leading-snug text-foreground group-hover:underline">{r.title}</h3>
                  <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground"><Clock className="size-3" /> {r.readingMinutes} min</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
      <Newsletter />
    </>
  )
}
