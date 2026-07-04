import type { Metadata } from 'next'
import { Palette, Download, RefreshCw } from 'lucide-react'
import { PageHero } from '@/components/site/page-hero'
import { TemplatesGallery } from '@/components/site/templates-gallery'
import { Cta } from '@/components/marketing/cta'

export const metadata: Metadata = {
  title: 'Templates — ToolForge',
  description:
    'Professionally designed, print-ready templates for invoices, quotes, receipts, contracts, and proposals. Add your brand and stay consistent.',
  alternates: { canonical: '/templates' },
}

const perks = [
  {
    title: 'Brand it once',
    description: 'Add your logo and colors a single time — every template inherits your identity.',
    icon: Palette,
  },
  {
    title: 'Print & PDF ready',
    description: 'Each layout is typographically tuned for crisp screen and print output.',
    icon: Download,
  },
  {
    title: 'Always consistent',
    description: 'Switch styles anytime; your data and branding carry across every document.',
    icon: RefreshCw,
  },
]

export default function TemplatesPage() {
  return (
    <>
      <PageHero
        eyebrow="Templates"
        title="Designed to make you look established"
        description="Every template is typographically tuned and print-ready. Pick a style, drop in your logo, and your entire document library stays consistent."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Templates' }]}
      />

      <div className="mx-auto max-w-6xl px-6">
        <section className="grid gap-5 py-14 sm:grid-cols-3">
          {perks.map((p) => {
            const Icon = p.icon
            return (
              <div
                key={p.title}
                className="rounded-2xl border border-border bg-card p-6 shadow-token-xs"
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-brand-muted text-brand">
                  <Icon className="size-5" strokeWidth={1.75} />
                </span>
                <h3 className="mt-4 font-semibold tracking-[-0.01em] text-foreground">{p.title}</h3>
                <p className="mt-1.5 text-pretty text-sm leading-relaxed text-muted-foreground">
                  {p.description}
                </p>
              </div>
            )
          })}
        </section>

        <section className="border-t border-border py-14 lg:py-16" aria-labelledby="gallery-heading">
          <h2
            id="gallery-heading"
            className="text-2xl font-semibold tracking-[-0.02em] text-foreground lg:text-3xl"
          >
            Browse the gallery
          </h2>
          <p className="mt-3 max-w-2xl text-pretty leading-relaxed text-muted-foreground">
            Filter by document type to preview the styles available for each tool.
          </p>
          <div className="mt-10">
            <TemplatesGallery />
          </div>
        </section>
      </div>

      <Cta />
    </>
  )
}
