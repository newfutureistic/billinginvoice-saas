import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Clock } from 'lucide-react'
import { PageHero } from '@/components/site/page-hero'
import { Newsletter } from '@/components/site/newsletter'
import { JsonLd } from '@/components/seo/json-ld'
import { BlogService } from '@/server/services/blog.service'
import { buildMetadata, breadcrumbSchema } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = buildMetadata({
  title: 'Blog',
  description:
    'Practical guides on invoicing, taxes, GST/VAT, freelancing, and getting paid — from the Bill Maker team.',
  path: '/blog',
})

function fmt(iso: string | null) {
  return iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string; tag?: string; q?: string }>
}) {
  const sp = await searchParams
  const page = Math.max(1, Number(sp.page) || 1)
  const service = new BlogService()

  // Degrade gracefully if the database is briefly unreachable (e.g. a Supabase pooler blip):
  // keep the page chrome and show a friendly notice instead of crashing the whole route.
  let items: Awaited<ReturnType<BlogService['publicList']>>['items'] = []
  let totalPages = 1
  let total = 0
  let categories: string[] = []
  let loadError = false
  try {
    const [list, cats] = await Promise.all([
      service.publicList({ page, pageSize: 9, category: sp.category, tag: sp.tag, q: sp.q }),
      service.categories(),
    ])
    items = list.items
    totalPages = list.totalPages
    total = list.total
    categories = cats
  } catch {
    loadError = true
  }

  const qs = (over: Record<string, string | number | undefined>) => {
    const p = new URLSearchParams()
    const merged = { category: sp.category, tag: sp.tag, q: sp.q, ...over }
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, String(v))
    const s = p.toString()
    return s ? `/blog?${s}` : '/blog'
  }

  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Blog', path: '/blog' }])} />
      <PageHero
        eyebrow="Blog"
        title="The invoicing playbook"
        description="Hard-won lessons on getting paid, staying tax-ready, and running a tidy business."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Blog' }]}
      />

      <div className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
        {/* Category filter (SSR via query params) */}
        <nav className="flex flex-wrap gap-2" aria-label="Blog categories">
          <Link
            href="/blog"
            className={`h-9 rounded-full border px-4 text-sm font-medium leading-9 transition-colors ${
              !sp.category ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground hover:text-foreground'
            }`}
          >
            All
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat}
              href={qs({ category: cat, page: undefined })}
              className={`h-9 rounded-full border px-4 text-sm font-medium leading-9 transition-colors ${
                sp.category === cat ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat}
            </Link>
          ))}
        </nav>

        {loadError ? (
          <div className="mt-16 rounded-2xl border border-border bg-card p-12 text-center">
            <h2 className="text-lg font-semibold text-foreground">Articles are momentarily unavailable</h2>
            <p className="mx-auto mt-2 max-w-md text-pretty text-muted-foreground">
              We couldn’t load the blog just now. Please refresh in a moment — in the meantime, you can still
              create an invoice.
            </p>
            <Link href="/invoice/new" className="mt-6 inline-flex text-sm font-medium text-brand hover:underline">
              Create an invoice
            </Link>
          </div>
        ) : items.length === 0 ? (
          <div className="mt-16 rounded-2xl border border-border bg-card p-12 text-center">
            <h2 className="text-lg font-semibold text-foreground">No articles yet</h2>
            <p className="mx-auto mt-2 max-w-md text-pretty text-muted-foreground">
              {sp.q || sp.category
                ? 'No posts match your filter. Try a different category or search.'
                : 'New articles are on the way. Check back soon.'}
            </p>
            {(sp.q || sp.category) && (
              <Link href="/blog" className="mt-6 inline-flex text-sm font-medium text-brand hover:underline">
                Clear filters
              </Link>
            )}
          </div>
        ) : (
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((post) => (
              <article key={post.id} className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-token-xs transition-all hover:-translate-y-0.5 hover:shadow-token-md">
                <Link href={`/blog/${post.slug}`} className="block">
                  <div className="aspect-[16/9] w-full overflow-hidden bg-brand-muted/40">
                    {post.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={post.coverImage} alt={post.coverAlt || post.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-muted to-secondary">
                        <Image
                          src="/blog.png"
                          alt=""
                          aria-hidden
                          width={2000}
                          height={2000}
                          sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 90vw"
                          className="h-full w-full object-contain p-5 transition-transform duration-300 group-hover:scale-[1.03]"
                        />
                      </div>
                    )}
                  </div>
                </Link>
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-xs font-medium uppercase tracking-wide text-brand">{post.category}</p>
                  <h2 className="mt-2 text-pretty text-lg font-semibold leading-snug tracking-[-0.01em] text-foreground">
                    <Link href={`/blog/${post.slug}`} className="hover:underline">{post.title}</Link>
                  </h2>
                  {post.excerpt && <p className="mt-2 line-clamp-3 text-pretty text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>}
                  <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{post.authorName}</span>
                    <span aria-hidden>·</span>
                    <span>{fmt(post.publishedAt)}</span>
                    <span className="ml-auto inline-flex items-center gap-1"><Clock className="size-3" /> {post.readingMinutes} min</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <nav className="mt-12 flex items-center justify-center gap-3" aria-label="Pagination">
            {page > 1 && (
              <Link href={qs({ page: page - 1 })} className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-4 py-2 text-sm hover:bg-muted">
                Previous
              </Link>
            )}
            <span className="text-sm text-muted-foreground">Page {page} of {totalPages} · {total} articles</span>
            {page < totalPages && (
              <Link href={qs({ page: page + 1 })} className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-4 py-2 text-sm hover:bg-muted">
                Next <ArrowRight className="size-4" />
              </Link>
            )}
          </nav>
        )}
      </div>
      <Newsletter />
    </>
  )
}
