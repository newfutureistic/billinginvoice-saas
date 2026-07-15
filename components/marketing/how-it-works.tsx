import { FilePlus2, SlidersHorizontal, Download } from 'lucide-react'

const steps = [
  {
    icon: FilePlus2,
    title: 'Add your details',
    description:
      'Enter your business and your client’s details once. Saved businesses and clients are reused on every future invoice.',
  },
  {
    icon: SlidersHorizontal,
    title: 'Add items, tax & branding',
    description:
      'List your line items, set GST / VAT or sales tax, apply a discount, pick a template, and add your logo and brand color. Totals update live.',
  },
  {
    icon: Download,
    title: 'Download, send & get paid',
    description:
      'Download a print-ready PDF, send it to your client, add a UPI / Razorpay pay link, and track exactly what has been paid.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 border-t border-border bg-secondary/30">
      <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-brand">How it works</p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.02em] text-foreground lg:text-4xl">
            A professional invoice in three steps
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            No learning curve. Go from a blank page to a polished, tax-ready invoice in about a minute.
          </p>
        </div>

        <ol className="mt-14 grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <li key={step.title} className="relative rounded-2xl border border-border bg-card p-7 shadow-token-xs">
                <span className="flex size-11 items-center justify-center rounded-xl bg-brand-muted text-brand">
                  <Icon className="size-5" aria-hidden />
                </span>
                <div className="mt-4 flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-brand">Step {i + 1}</span>
                </div>
                <h3 className="mt-1 text-lg font-semibold tracking-[-0.01em] text-foreground">{step.title}</h3>
                <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">{step.description}</p>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
