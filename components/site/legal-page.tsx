import { Breadcrumbs } from '@/components/site/breadcrumbs'

export type LegalSection = { heading: string; paragraphs: string[] }

export function LegalPage({
  title,
  updated,
  intro,
  sections,
}: {
  title: string
  updated: string
  intro: string
  sections: LegalSection[]
}) {
  return (
    <>
      <div className="border-b border-border bg-secondary/30">
        <div className="mx-auto max-w-3xl px-6 py-12 lg:py-16">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: title }]} />
          <h1 className="mt-8 text-balance text-4xl font-semibold tracking-[-0.025em] text-foreground lg:text-5xl">
            {title}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">Last updated: {updated}</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-14 lg:py-16">
        <p className="text-pretty text-lg leading-relaxed text-foreground">{intro}</p>

        <nav className="mt-10 rounded-2xl border border-border bg-card p-6 shadow-token-xs">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            On this page
          </p>
          <ol className="mt-3 space-y-2">
            {sections.map((s, i) => (
              <li key={s.heading}>
                <a
                  href={`#section-${i + 1}`}
                  className="text-sm text-brand transition-colors hover:underline"
                >
                  {i + 1}. {s.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-12 space-y-10">
          {sections.map((s, i) => (
            <section key={s.heading} id={`section-${i + 1}`} className="scroll-mt-24">
              <h2 className="text-xl font-semibold tracking-[-0.01em] text-foreground">
                {i + 1}. {s.heading}
              </h2>
              <div className="mt-3 space-y-3">
                {s.paragraphs.map((p, j) => (
                  <p key={j} className="text-pretty leading-relaxed text-muted-foreground">
                    {p}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-border bg-secondary/40 p-6 text-sm leading-relaxed text-muted-foreground">
          This document is provided for general informational purposes and does not constitute legal
          advice. Questions? Email{' '}
          <a href="mailto:legal@bill-maker.com" className="font-medium text-brand hover:underline">
            legal@bill-maker.com
          </a>
          .
        </div>
      </div>
    </>
  )
}
