import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Clock } from 'lucide-react'
import { BlogService } from '@/server/services/blog.service'

/** Homepage "From the blog" — the latest 3 published posts, straight from the DB. */
export async function LatestPosts() {
  let posts
  try {
    posts = await new BlogService().latest(3)
  } catch {
    return null // never break the homepage on a DB blip
  }
  if (!posts.length) return null

  return (
    <section id="blog" className="scroll-mt-20 border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-brand">From the blog</p>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.02em] text-foreground lg:text-4xl">
              Guides to invoice smarter
            </h2>
          </div>
          <Link href="/blog" className="hidden shrink-0 items-center gap-1.5 text-sm font-medium text-brand hover:underline sm:inline-flex">
            All articles <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
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
                <h3 className="mt-2 text-pretty font-semibold leading-snug tracking-[-0.01em] text-foreground">
                  <Link href={`/blog/${post.slug}`} className="hover:underline">{post.title}</Link>
                </h3>
                {post.excerpt && <p className="mt-2 line-clamp-2 text-pretty text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>}
                <p className="mt-4 inline-flex items-center gap-1 text-xs text-muted-foreground"><Clock className="size-3" /> {post.readingMinutes} min read</p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 sm:hidden">
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline">
            All articles <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
