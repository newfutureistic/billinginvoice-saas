import { Breadcrumbs, type Crumb } from '@/components/site/breadcrumbs'

export function PageHero({
  eyebrow,
  title,
  description,
  breadcrumbs,
  children,
  align = 'left',
}: {
  eyebrow?: string
  title: string
  description?: string
  breadcrumbs?: Crumb[]
  children?: React.ReactNode
  align?: 'left' | 'center'
}) {
  return (
    <section className="border-b border-border bg-secondary/30">
      <div className="mx-auto max-w-6xl px-6 py-12 lg:py-16">
        {breadcrumbs && (
          <div className="mb-8">
            <Breadcrumbs items={breadcrumbs} />
          </div>
        )}
        <div className={align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-3xl'}>
          {eyebrow && (
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-brand">
              {eyebrow}
            </p>
          )}
          <h1 className="text-balance text-4xl font-semibold tracking-[-0.025em] text-foreground lg:text-5xl">
            {title}
          </h1>
          {description && (
            <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
          {children && <div className="mt-8">{children}</div>}
        </div>
      </div>
    </section>
  )
}
