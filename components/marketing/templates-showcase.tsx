import Link from 'next/link'
import { templates } from '@/lib/marketing-content'

function TemplateThumb({ accent, variant }: { accent: string; variant: number }) {
  const centered = variant === 1
  const banner = variant === 2
  return (
    <div className="aspect-[3/4] w-full overflow-hidden rounded-lg border border-border bg-card p-4 shadow-token-xs">
      {banner && (
        <div className="mb-3 h-6 w-full rounded" style={{ backgroundColor: accent }} />
      )}
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
            <div className="h-1.5 w-8 rounded-full" style={{ backgroundColor: `${accent}` }} />
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-end border-t border-border pt-3">
        <div className="h-4 w-16 rounded" style={{ backgroundColor: accent }} />
      </div>
    </div>
  )
}

export function TemplatesShowcase() {
  return (
    <section id="templates" className="border-y border-border bg-secondary/40">
      <div className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20 lg:py-28">
        <div className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-brand">Templates</p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.02em] text-foreground lg:text-4xl">
            Designed to make you look established
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            Every template is typographically tuned and print-ready. Pick a style, drop in your
            logo, and your entire document library stays consistent.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-5 lg:grid-cols-4">
          {templates.map((t, i) => (
            <Link key={t.name} href={`/invoice/new?template=${t.templateId}`} className="group focus-visible:outline-none">
              <div className="rounded-lg transition-transform duration-300 group-hover:-translate-y-1 group-focus-visible:ring-2 group-focus-visible:ring-ring/50">
                <TemplateThumb accent={t.accent} variant={i} />
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-foreground group-hover:text-brand transition-colors">{t.name}</h3>
                <p className="text-sm text-muted-foreground">{t.style}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
