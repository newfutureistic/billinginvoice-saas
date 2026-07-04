import { ArrowRight, Sparkles, Star } from 'lucide-react'
import { InvoicePreview } from './invoice-preview'

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      {/* Subtle grid backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.4]"
        style={{
          backgroundImage:
            'linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 80%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 80%)',
        }}
      />

      <div className="mx-auto max-w-6xl px-6 pb-20 pt-16 lg:pb-28 lg:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          {/* Copy */}
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-token-xs">
              <Sparkles className="size-3.5 text-brand" />
              <span>40+ business tools, one workspace</span>
            </div>

            <h1 className="mt-6 text-balance text-[2.6rem] font-semibold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-5xl lg:text-6xl">
              Professional invoices,{' '}
              <span className="text-brand">generated in seconds</span>
            </h1>

            <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground">
              ToolForge is the operating system for your business paperwork. Create tax-ready
              invoices, quotes, and contracts that look like they came from a company ten times
              your size — then send, track, and get paid.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="/tools/invoice-generator"
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-[0.95rem] font-medium text-primary-foreground shadow-token-md transition-all hover:bg-primary/90 hover:shadow-token-lg"
              >
                Create your invoice
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <a
                href="#featured-tools"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-border bg-card px-6 text-[0.95rem] font-medium text-foreground shadow-token-xs transition-colors hover:bg-muted"
              >
                Explore all tools
              </a>
            </div>

            <div className="mt-8 flex items-center gap-4">
              <div className="flex -space-x-2">
                {['MO', 'DR', 'SL', 'JK'].map((i) => (
                  <span
                    key={i}
                    className="flex size-8 items-center justify-center rounded-full border-2 border-background bg-secondary text-[0.65rem] font-semibold text-secondary-foreground"
                  >
                    {i}
                  </span>
                ))}
              </div>
              <div className="text-sm">
                <div className="flex items-center gap-1 text-warning">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-3.5" fill="currentColor" strokeWidth={0} />
                  ))}
                </div>
                <p className="mt-0.5 text-muted-foreground">
                  <span className="font-medium text-foreground">4.9/5</span> from 12,000+ businesses
                </p>
              </div>
            </div>
          </div>

          {/* Live preview */}
          <div className="relative lg:pl-4">
            <div
              aria-hidden
              className="absolute -inset-6 -z-10 rounded-[2rem] bg-brand-muted/60 blur-2xl"
            />
            <InvoicePreview />
          </div>
        </div>
      </div>
    </section>
  )
}
