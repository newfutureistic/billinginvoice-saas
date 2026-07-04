'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { blogCategories, type BlogPost } from '@/lib/site-data'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function BlogListing({ posts }: { posts: BlogPost[] }) {
  const [active, setActive] = useState('All')

  const filtered = useMemo(
    () => (active === 'All' ? posts : posts.filter((p) => p.category === active)),
    [active, posts],
  )

  const featured = active === 'All' ? posts.find((p) => p.featured) : undefined
  const rest = featured ? filtered.filter((p) => p.slug !== featured.slug) : filtered

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
      <div className="flex flex-wrap gap-2">
        {blogCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`h-9 rounded-full border px-4 text-sm font-medium transition-colors ${
              active === cat
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-muted-foreground hover:border-border-strong hover:text-foreground'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {featured && (
        <Link
          href={`/blog/${featured.slug}`}
          className="group mt-10 grid overflow-hidden rounded-2xl border border-border bg-card shadow-token-xs transition-all hover:shadow-token-md lg:grid-cols-2"
        >
          <div className="flex aspect-[16/10] items-center justify-center bg-secondary/60 lg:aspect-auto">
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {featured.category}
            </span>
          </div>
          <div className="flex flex-col justify-center p-8 lg:p-10">
            <span className="inline-flex w-fit items-center rounded-full bg-brand-muted px-2.5 py-1 text-xs font-medium text-brand">
              Featured
            </span>
            <h2 className="mt-4 text-balance text-2xl font-semibold tracking-[-0.02em] text-foreground lg:text-3xl">
              {featured.title}
            </h2>
            <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
              {featured.excerpt}
            </p>
            <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{featured.author.name}</span>
              <span aria-hidden>·</span>
              <span>{formatDate(featured.date)}</span>
              <span aria-hidden>·</span>
              <span>{featured.readingTime} min read</span>
            </div>
          </div>
        </Link>
      )}

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {rest.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-token-xs transition-all hover:-translate-y-0.5 hover:shadow-token-md"
          >
            <div className="flex aspect-[16/9] items-center justify-center bg-secondary/60">
              <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {post.category}
              </span>
            </div>
            <div className="flex flex-1 flex-col p-6">
              <span className="text-xs font-medium uppercase tracking-[0.08em] text-brand">
                {post.category}
              </span>
              <h3 className="mt-2 text-pretty text-lg font-semibold leading-snug tracking-[-0.01em] text-foreground">
                {post.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-pretty text-sm leading-relaxed text-muted-foreground">
                {post.excerpt}
              </p>
              <div className="mt-auto flex items-center gap-2 pt-5 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{post.author.name}</span>
                <span aria-hidden>·</span>
                <span>{post.readingTime} min</span>
                <ArrowRight className="ml-auto size-4 text-brand transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {rest.length === 0 && !featured && (
        <div className="mt-16 rounded-2xl border border-dashed border-border py-16 text-center">
          <p className="font-medium text-foreground">No articles in this category yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Check back soon or explore all posts.</p>
        </div>
      )}
    </div>
  )
}
