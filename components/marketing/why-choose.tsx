import Image from 'next/image'
import { Check } from 'lucide-react'
import { whyChoose } from '@/lib/marketing-content'

const highlights = [
  'No credit card to start',
  'Cancel anytime',
  'GDPR & SOC 2 aligned',
]

const illustratedFeatures = [
  {
    img: '/security.png',
    title: 'Your data stays private and secure',
    desc: 'Every invoice is encrypted in transit and at rest. Your business and client details are never sold or shared.',
  },
  {
    img: '/multi-currency.png',
    title: 'Bill clients in any currency',
    desc: 'Create GST & VAT-ready invoices in 10+ currencies, so you can get paid by clients anywhere in the world.',
  },
]

export function WhyChoose() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        {/* Left: statement */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-brand">Why Bill Maker</p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.02em] text-foreground lg:text-4xl">
            The polish of enterprise software, without the overhead
          </h2>
          <p className="mt-5 text-pretty text-lg leading-relaxed text-muted-foreground">
            Most business tools force a trade-off between powerful and pleasant. Bill Maker refuses
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

      {/* Illustrated proof points — security & multi-currency */}
      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:mt-20">
        {illustratedFeatures.map((f) => (
          <div
            key={f.title}
            className="flex flex-col items-start gap-5 rounded-2xl border border-border bg-card p-7 shadow-token-xs transition-shadow hover:shadow-token-md sm:flex-row sm:items-center"
          >
            <div className="flex w-full shrink-0 items-center justify-center rounded-xl bg-brand-muted/40 p-3 sm:w-36">
              <Image
                src={f.img}
                alt=""
                aria-hidden
                width={2000}
                height={2000}
                sizes="(min-width: 640px) 128px, 160px"
                className="h-32 w-32 object-contain sm:h-28 sm:w-28"
              />
            </div>
            <div>
              <h3 className="font-semibold tracking-[-0.01em] text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
