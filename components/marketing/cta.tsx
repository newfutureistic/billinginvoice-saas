import { ArrowRight } from 'lucide-react'

export function Cta() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
      <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-16 text-center shadow-token-xl lg:px-16 lg:py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(to right, var(--primary-foreground) 1px, transparent 1px), linear-gradient(to bottom, var(--primary-foreground) 1px, transparent 1px)',
            backgroundSize: '44px 44px',
            maskImage: 'radial-gradient(ellipse 70% 80% at 50% 50%, black 30%, transparent 75%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 70% 80% at 50% 50%, black 30%, transparent 75%)',
          }}
        />
        <div className="relative mx-auto max-w-xl">
          <h2 className="text-balance text-3xl font-semibold tracking-[-0.02em] text-primary-foreground lg:text-4xl">
            Your next invoice is a minute away
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-primary-foreground/70">
            Join 12,000+ businesses billing smarter with ToolForge. No credit card required to
            start.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href="/tools/invoice-generator"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-background px-6 text-[0.95rem] font-medium text-foreground shadow-token-md transition-transform hover:-translate-y-0.5"
            >
              Create your invoice
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="#pricing"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-primary-foreground/20 px-6 text-[0.95rem] font-medium text-primary-foreground transition-colors hover:bg-primary-foreground/10"
            >
              View pricing
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
