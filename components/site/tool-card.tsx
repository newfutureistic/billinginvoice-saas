import Link from 'next/link'
import { ArrowUpRight, Star } from 'lucide-react'
import type { CatalogTool } from '@/lib/site-data'
import { cn } from '@/lib/utils'

const statusStyles: Record<string, string> = {
  popular: 'bg-brand-muted text-brand',
  new: 'bg-success-muted text-success',
  pro: 'bg-warning-muted text-warning-foreground',
}

const statusLabel: Record<string, string> = {
  popular: 'Popular',
  new: 'New',
  pro: 'Pro',
}

export function ToolCard({ tool }: { tool: CatalogTool }) {
  const Icon = tool.icon
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group relative flex flex-col rounded-2xl border border-border bg-card p-6 shadow-token-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-token-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      <div className="flex items-start justify-between">
        <span className="flex size-11 items-center justify-center rounded-xl border border-border bg-secondary/60 text-foreground transition-colors group-hover:border-brand/30 group-hover:bg-brand-muted group-hover:text-brand">
          <Icon className="size-5" strokeWidth={1.75} />
        </span>
        <div className="flex items-center gap-2">
          {tool.status && (
            <span
              className={cn(
                'rounded-full px-2.5 py-0.5 text-xs font-medium',
                statusStyles[tool.status],
              )}
            >
              {statusLabel[tool.status]}
            </span>
          )}
          <ArrowUpRight className="size-4 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
        </div>
      </div>

      <h3 className="mt-5 text-base font-semibold tracking-[-0.01em] text-foreground">
        {tool.name}
      </h3>
      <p className="mt-1.5 flex-1 text-pretty text-sm leading-relaxed text-muted-foreground">
        {tool.tagline}
      </p>

      <div className="mt-5 flex items-center gap-3 border-t border-border pt-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Star className="size-3.5 text-warning" fill="currentColor" strokeWidth={0} />
          {tool.rating.toFixed(1)}
        </span>
        <span className="size-1 rounded-full bg-border-strong" aria-hidden />
        <span>{tool.uses} uses</span>
      </div>
    </Link>
  )
}
