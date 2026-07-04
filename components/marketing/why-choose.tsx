import { Check } from 'lucide-react'
import { whyChoose } from '@/lib/marketing-content'

const highlights = [
  'No credit card to start',
  'Cancel anytime',
  'GDPR & SOC 2 aligned',
]

export function WhyChoose() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        {/* Left: statement */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-brand">Why ToolForge</p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.02em] text-foreground lg:text-4xl">
            The polish of enterprise software, without the overhead
          </h2>
          <p className="mt-5 text-pretty text-lg leading-relaxed text-muted-foreground">
            Most business tools force a trade-off between powerful and pleasant. ToolForge refuses
            it — every detail is considered, so your paperwork reflects the quality of your work.
          </p>
          <ul className="mt-8 space-y-3">
            {highlights.map((h) => (
              <li key={h} className="flex items-center gap-3 text-sm text-foreground">
                <span className="flex size-5 items-center justify-center rounded-full bg-success-muted text-success">
                  <Check className="size-3" strokeWidth={3} />
                </span>
                {h}
              </li>
            ))}
          </ul>
        </div>

        {/* Right: value grid */}
        <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2">
          {whyChoose.map((item) => (
            <div key={item.title} className="bg-card p-7">
              <span className="flex size-11 items-center justify-center rounded-xl bg-brand-muted text-brand">
                <item.icon className="size-5" />
              </span>
              <h3 className="mt-5 font-semibold tracking-[-0.01em] text-foreground">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
