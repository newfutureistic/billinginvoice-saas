import { Layers, Palette, Shapes, Sparkles, Type } from 'lucide-react'

const STATS = [
  { value: '18', label: 'Color tokens' },
  { value: '10', label: 'Type styles' },
  { value: '13', label: 'Spacing steps' },
  { value: '6', label: 'Radii' },
]

const PILLARS = [
  { icon: Palette, title: 'Considered color', body: 'A restrained, accessible palette built on semantic tokens — never raw hex values.' },
  { icon: Type, title: 'Editorial type', body: 'A tuned scale with optical tracking and generous line-height for effortless reading.' },
  { icon: Shapes, title: 'Consistent shape', body: 'One radius language and a soft, whisper-quiet elevation model across every surface.' },
  { icon: Sparkles, title: 'Meaningful motion', body: 'Transitions that clarify state and hierarchy — calm, quick, and never decorative.' },
]

export function OverviewSection() {
  return (
    <section id="overview" className="scroll-mt-24 py-14 lg:py-20">
      <div className="max-w-3xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 font-mono text-xs text-muted-foreground shadow-token-xs">
          <Layers className="size-3.5 text-brand" />
          Foundation · v1.0
        </span>
        <h1 className="mt-6 text-pretty text-5xl font-semibold tracking-[-0.03em] text-foreground lg:text-6xl">
          The Bill Maker Design System
        </h1>
        <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground lg:text-xl">
          A premium, enterprise-grade visual foundation. Every token, type style, and
          component here is handcrafted to feel calm, confident, and timeless — the
          groundwork every future Bill Maker product is built on.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="#color"
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-token-sm transition-transform hover:-translate-y-px active:translate-y-0"
          >
            Explore foundations
          </a>
          <a
            href="#buttons"
            className="rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-token-xs transition-colors hover:bg-muted"
          >
            View components
          </a>
        </div>
      </div>

      <dl className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border shadow-token-xs sm:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="bg-card px-5 py-6">
            <dt className="font-mono text-3xl font-semibold tracking-tight text-foreground">
              {s.value}
            </dt>
            <dd className="mt-1 text-sm text-muted-foreground">{s.label}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {PILLARS.map((p) => (
          <div
            key={p.title}
            className="group flex gap-4 rounded-xl border border-border bg-card p-5 shadow-token-xs transition-all hover:-translate-y-0.5 hover:shadow-token-md"
          >
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-muted text-brand">
              <p.icon className="size-5" strokeWidth={1.75} />
            </span>
            <div>
              <h3 className="text-base font-medium text-foreground">{p.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
