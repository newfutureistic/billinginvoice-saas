'use client'

import { useMemo, useState } from 'react'
import { Search, SearchX } from 'lucide-react'
import { tools, categories } from '@/lib/site-data'
import { ToolCard } from '@/components/site/tool-card'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 9

export function ToolsExplorer() {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState<string>('all')
  const [visible, setVisible] = useState(PAGE_SIZE)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return tools.filter((t) => {
      const matchesCategory = active === 'all' || t.category === active
      const matchesQuery =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.tagline.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
      return matchesCategory && matchesQuery
    })
  }, [query, active])

  const shown = filtered.slice(0, visible)

  function selectCategory(slug: string) {
    setActive(slug)
    setVisible(PAGE_SIZE)
  }

  return (
    <div>
      {/* Search */}
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <label htmlFor="tool-search" className="sr-only">
          Search tools
        </label>
        <input
          id="tool-search"
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setVisible(PAGE_SIZE)
          }}
          placeholder="Search 40+ tools by name or task…"
          className="h-12 w-full rounded-xl border border-input bg-card pl-11 pr-4 text-sm text-foreground shadow-token-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
        />
      </div>

      {/* Category filters */}
      <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="Filter by category">
        <FilterChip label="All tools" active={active === 'all'} onClick={() => selectCategory('all')} />
        {categories.map((c) => (
          <FilterChip
            key={c.slug}
            label={c.name}
            active={active === c.slug}
            onClick={() => selectCategory(c.slug)}
          />
        ))}
      </div>

      {/* Results meta */}
      <p className="mt-6 text-sm text-muted-foreground" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? 'tool' : 'tools'}
        {query && (
          <>
            {' '}for <span className="font-medium text-foreground">“{query}”</span>
          </>
        )}
      </p>

      {/* Grid or empty state */}
      {filtered.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-secondary/30 px-6 py-20 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <SearchX className="size-6" strokeWidth={1.75} />
          </span>
          <h3 className="mt-5 text-lg font-semibold text-foreground">No tools found</h3>
          <p className="mt-2 max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground">
            We couldn&apos;t find a tool matching your search. Try a different term or browse a
            category.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery('')
              setActive('all')
              setVisible(PAGE_SIZE)
            }}
            className="mt-6 inline-flex h-10 items-center rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>

          {visible < filtered.length && (
            <div className="mt-10 flex justify-center">
              <button
                type="button"
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
                className="inline-flex h-11 items-center rounded-xl border border-border bg-card px-6 text-sm font-medium text-foreground shadow-token-xs transition-colors hover:bg-muted"
              >
                Load more tools
                <span className="ml-2 text-muted-foreground">
                  {filtered.length - visible} left
                </span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        'inline-flex h-9 items-center rounded-full border px-4 text-sm font-medium transition-colors',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-card text-muted-foreground hover:border-border-strong hover:text-foreground',
      )}
    >
      {label}
    </button>
  )
}
