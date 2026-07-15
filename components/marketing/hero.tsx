import Image from 'next/image'
import { ArrowRight, Sparkles, Check, Lock, Globe, FileDown } from 'lucide-react'

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
              <span>Free professional invoice generator</span>
            </div>

            <h1 className="mt-6 text-balance text-[2.6rem] font-semibold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-5xl lg:text-6xl">
              Professional invoices,{' '}
              <span className="text-brand">generated in seconds</span>
            </h1>

            <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground">
              Bill Maker is a dedicated invoice generator. Create GST-ready, multi-currency invoices
              that look like they came from a company ten times your size — then download the PDF,
              send it, and track payments until you get paid.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="/invoice/new"
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-[0.95rem] font-medium text-primary-foreground shadow-token-md transition-all hover:bg-primary/90 hover:shadow-token-lg"
              >
                Create your invoice
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <a
                href="#templates"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-border bg-card px-6 text-[0.95rem] font-medium text-foreground shadow-token-xs transition-colors hover:bg-muted"
              >
                View templates
              </a>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              {['No signup to start', 'GST & VAT ready', 'Free to use'].map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5">
                  <Check className="size-4 text-success" aria-hidden />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Product showcase — the real invoice illustration, framed as a browser window */}
          <div className="relative lg:pl-4">
            <div
              aria-hidden
              className="absolute -inset-8 -z-10 rounded-[2.5rem] bg-gradient-to-tr from-brand-muted/70 via-brand-muted/25 to-transparent blur-3xl"
            />
            <div className="animate-float">
              <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-token-xl">
                {/* Browser chrome — frames the invoice as a product window */}
                <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-2.5">
                  <span className="flex gap-1.5" aria-hidden>
                    <span className="size-2.5 rounded-full bg-destructive/40" />
                    <span className="size-2.5 rounded-full bg-warning/50" />
                    <span className="size-2.5 rounded-full bg-success/50" />
                  </span>
                  <span className="mx-auto inline-flex items-center gap-1.5 rounded-md bg-background px-3 py-1 text-[0.7rem] font-medium text-muted-foreground shadow-token-xs">
                    <Lock className="size-3" aria-hidden />
                    bill-maker.com/invoice
                  </span>
                </div>
                <div className="bg-card px-6 py-4">
                  <Image
                    src="/invoice.png"
                    alt="A professional Bill Maker invoice ready to download and send"
                    width={2000}
                    height={2000}
                    priority
                    sizes="(min-width: 1024px) 520px, (min-width: 640px) 60vw, 90vw"
                    className="h-auto w-full object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Professional feature callouts */}
            <span className="absolute -left-3 top-20 hidden items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-token-lg lg:inline-flex">
              <Check className="size-3.5 text-success" aria-hidden />
              GST &amp; VAT ready
            </span>
            <span className="absolute -right-3 top-40 hidden items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-token-lg lg:inline-flex">
              <Globe className="size-3.5 text-brand" aria-hidden />
              Multi-currency
            </span>
            <span className="absolute -left-2 bottom-10 hidden items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-token-lg lg:inline-flex">
              <FileDown className="size-3.5 text-brand" aria-hidden />
              Print-ready PDF
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
