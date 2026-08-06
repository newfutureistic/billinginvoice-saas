'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export type Template = {
  name: string
  style: string
  type: string
  accent: string
  variant: number
  badge?: string
  /** Real builder template id (`lib/invoice-templates.ts`) this card starts the builder on. */
  templateId: string
}

const templates: Template[] = [
  { name: 'Classic Invoice', style: 'Timeless and clean', type: 'Invoices', accent: 'oklch(0.545 0.152 258)', variant: 0, badge: 'Popular', templateId: 'classic' },
  { name: 'Minimal Invoice', style: 'Whitespace-forward', type: 'Invoices', accent: 'oklch(0.26 0.017 268)', variant: 1, templateId: 'minimal' },
  { name: 'Modern Invoice', style: 'Bold and confident', type: 'Invoices', accent: 'oklch(0.58 0.12 158)', variant: 2, templateId: 'modern' },
  { name: 'Corporate Invoice', style: 'Formal and structured', type: 'Invoices', accent: 'oklch(0.72 0.135 74)', variant: 0, templateId: 'corporate' },
  { name: 'GST Invoice', style: 'Tax-ready with HSN/SAC', type: 'Invoices', accent: 'oklch(0.545 0.152 258)', variant: 1, badge: 'New', templateId: 'classic' },
  { name: 'Freelancer Invoice', style: 'Simple and fast', type: 'Invoices', accent: 'oklch(0.58 0.12 158)', variant: 2, templateId: 'minimal' },
  { name: 'Service Receipt', style: 'Clean confirmation', type: 'Receipts', accent: 'oklch(0.58 0.12 158)', variant: 1, templateId: 'modern' },
  { name: 'Retail Receipt', style: 'Compact and itemized', type: 'Receipts', accent: 'oklch(0.72 0.135 74)', variant: 0, templateId: 'corporate' },
  { name: 'Payment Receipt', style: 'Proof of payment', type: 'Receipts', accent: 'oklch(0.26 0.017 268)', variant: 2, templateId: 'elegant' },
]

const types = ['All', 'Invoices', 'Receipts']

function TemplateThumb({ accent, variant }: { accent: string; variant: number }) {
  const centered = variant === 1
  const banner = variant === 2
  return (
    <div className="aspect-[3/4] w-full overflow-hidden rounded-lg border border-border bg-card p-4 shadow-token-xs">
      {banner && <div className="mb-3 h-6 w-full rounded" style={{ backgroundColor: accent }} />}
      <div className={centered ? 'text-center' : 'flex items-start justify-between'}>
        <div className={centered ? 'mx-auto' : ''}>
          <div
            className="h-4 w-16 rounded-sm"
            style={{ backgroundColor: banner ? 'var(--secondary)' : accent }}
          />
          <div className="mt-1.5 h-1.5 w-10 rounded-full bg-muted" />
        </div>
        {!centered && !banner && (
          <div className="space-y-1 text-right">
            <div className="ml-auto h-1.5 w-12 rounded-full bg-muted" />
            <div className="ml-auto h-1.5 w-8 rounded-full bg-muted" />
          </div>
        )}
      </div>
      <div className={`mt-4 space-y-1 ${centered ? 'mx-auto max-w-[70%]' : ''}`}>
        <div className="h-1.5 w-full rounded-full bg-muted" />
        <div className="h-1.5 w-2/3 rounded-full bg-muted" />
      </div>
      <div className="mt-4 space-y-2">
        {[0, 1, 2, 3].map((r) => (
          <div key={r} className="flex items-center justify-between gap-2">
            <div className="h-1.5 flex-1 rounded-full bg-muted" />
            <div className="h-1.5 w-6 rounded-full bg-muted" />
            <div className="h-1.5 w-8 rounded-full" style={{ backgroundColor: accent }} />
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-end border-t border-border pt-3">
        <div className="h-4 w-16 rounded" style={{ backgroundColor: accent }} />
      </div>
    </div>
  )
}

export function TemplatesGallery() {
  const [active, setActive] = useState('All')
  const filtered = active === 'All' ? templates : templates.filter((t) => t.type === active)

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter templates by type">
        {types.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={active === t}
            onClick={() => setActive(t)}
            className={cn(
              'inline-flex h-9 items-center rounded-full border px-4 text-sm font-medium transition-colors',
              active === t
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-muted-foreground hover:border-border-strong hover:text-foreground',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-2 gap-5 lg:grid-cols-4">
        {filtered.map((t) => (
          <Link
            key={t.name}
            href={`/invoice/new?template=${t.templateId}`}
            className="group focus-visible:outline-none"
          >
            <div className="relative transition-transform duration-300 group-hover:-translate-y-1">
              {t.badge && (
                <span className="absolute -right-2 -top-2 z-10 rounded-full bg-brand px-2.5 py-0.5 text-xs font-medium text-brand-foreground shadow-token-sm">
                  {t.badge}
                </span>
              )}
              <div className="rounded-lg ring-offset-2 transition group-focus-visible:ring-2 group-focus-visible:ring-ring/50">
                <TemplateThumb accent={t.accent} variant={t.variant} />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">{t.name}</h3>
                <p className="text-sm text-muted-foreground">{t.style}</p>
              </div>
              <ArrowRight className="size-4 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
