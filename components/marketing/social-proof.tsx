import { stats, trustLogos } from '@/lib/marketing-content'

export function TrustLogos() {
  return (
    <section className="border-y border-border bg-secondary/40">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <p className="text-center text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Trusted by modern businesses worldwide
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {trustLogos.map((logo) => (
            <span
              key={logo}
              className="text-lg font-semibold tracking-[-0.02em] text-muted-foreground/70 transition-colors hover:text-foreground"
            >
              {logo}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Stats() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card px-6 py-8 text-center">
            <div className="text-3xl font-semibold tracking-[-0.02em] text-foreground tabular-nums lg:text-4xl">
              {stat.value}
            </div>
            <div className="mt-2 text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
