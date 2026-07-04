import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { featuredTools } from '@/lib/marketing-content'

export function FeaturedTools() {
  const [primary, ...rest] = featuredTools

  return (
    <section id="featured-tools" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20 lg:py-28">
      <div className="max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-brand">Featured tools</p>
        <h2 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.02em] text-foreground lg:text-4xl">
          Start with the invoice generator
        </h2>
        <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
          The tool our customers reach for every day — and a whole workspace of others ready when
          you need them.
        </p>
      </div>

      <div className="mt-12 grid gap-5 lg:grid-cols-[1.15fr_1fr]">
        {/* Primary featured tool */}
        <a
          href={primary.href}
          className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-token-sm transition-all hover:-translate-y-0.5 hover:shadow-token-lg"
        >
          <div
            aria-hidden
            className="absolute -right-16 -top-16 size-48 rounded-full bg-brand-muted/70 blur-2xl transition-opacity group-hover:opacity-100"
          />
          <div className="relative">
            <div className="flex items-center justify-between">
              <span className="flex size-12 items-center justify-center rounded-xl bg-brand text-brand-foreground shadow-token-sm">
                <primary.icon className="size-6" />
              </span>
              {primary.badge && (
                <span className="rounded-full border border-brand/20 bg-brand-muted px-2.5 py-1 text-xs font-medium text-brand">
                  {primary.badge}
                </span>
              )}
            </div>
            <h3 className="mt-6 text-2xl font-semibold tracking-[-0.02em] text-foreground">
              {primary.name}
            </h3>
            <p className="mt-3 max-w-md text-pretty leading-relaxed text-muted-foreground">
              {primary.description}
            </p>
          </div>
          <div className="relative mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-brand">
            Open the generator
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </div>
        </a>

        {/* Secondary tools */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
          {rest.map((tool) => (
            <a
              key={tool.name}
              href={tool.href}
              className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-6 shadow-token-xs transition-all hover:-translate-y-0.5 hover:shadow-token-md"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-foreground">
                <tool.icon className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold tracking-[-0.01em] text-foreground">{tool.name}</h3>
                  <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {tool.description}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
