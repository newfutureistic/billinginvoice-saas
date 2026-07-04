'use client'

import { useMemo, useState } from 'react'
import { Search, FileText } from 'lucide-react'
import { popularArticles } from '@/lib/site-data'

export function HelpSearch() {
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return popularArticles.filter(
      (a) => a.title.toLowerCase().includes(q) || a.category.toLowerCase().includes(q),
    )
  }, [query])

  return (
    <div className="relative mx-auto max-w-xl">
      <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for answers…"
        className="h-13 w-full rounded-xl border border-input bg-card py-3.5 pl-12 pr-4 text-sm text-foreground shadow-token-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
      />

      {query.trim() && (
        <div className="absolute z-10 mt-2 w-full overflow-hidden rounded-xl border border-border bg-card text-left shadow-token-lg">
          {results.length > 0 ? (
            <ul className="max-h-72 overflow-auto py-1">
              {results.map((r) => (
                <li key={r.title}>
                  <a
                    href="#"
                    className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-secondary"
                  >
                    <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <span>
                      <span className="block text-sm font-medium text-foreground">{r.title}</span>
                      <span className="text-xs text-muted-foreground">{r.category}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              No articles found for “{query}”. Try different keywords.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
