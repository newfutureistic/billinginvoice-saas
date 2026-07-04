import { ArrowRight } from 'lucide-react'
import { toolCategories } from '@/lib/marketing-content'

export function ToolCategories() {
  return (
    <section className="border-y border-border bg-secondary/40">
      <div className="mx-auto max-w-6xl px-6 py-20 lg:py-24">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-brand">
              Everything in one place
            </p>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.02em] text-foreground lg:text-4xl">
              A tool for every part of the job
            </h2>
          </div>
          <a
            href="#featured-tools"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-brand"
          >
            Browse all 40+ tools
            <ArrowRight className="size-4" />
          </a>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {toolCategories.map((cat) => (
            <div
              key={cat.name}
              className="group flex flex-col rounded-2xl border border-border bg-card p-6 shadow-token-xs transition-all hover:-translate-y-0.5 hover:shadow-token-md"
            >
              <div className="flex items-center justify-between">
                <span className="flex size-11 items-center justify-center rounded-xl bg-secondary text-foreground transition-colors group-hover:bg-brand group-hover:text-brand-foreground">
                  <cat.icon className="size-5" />
                </span>
                <span className="font-mono text-xs text-muted-foreground">{cat.count} tools</span>
              </div>
              <h3 className="mt-5 font-semibold tracking-[-0.01em] text-foreground">{cat.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {cat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
