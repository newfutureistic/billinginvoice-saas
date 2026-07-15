import { Plus } from 'lucide-react'
import { faqs } from '@/lib/marketing-content'

export function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20 lg:py-28">
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-brand">FAQ</p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.02em] text-foreground lg:text-4xl">
            Questions, answered
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            Still curious? Reach our team at{' '}
            <a href="mailto:hello@bill-maker.com" className="font-medium text-brand hover:underline">
              hello@bill-maker.com
            </a>
            .
          </p>
        </div>

        <div className="divide-y divide-border border-y border-border">
          {faqs.map((faq) => (
            <details key={faq.question} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left">
                <span className="text-pretty font-medium text-foreground">{faq.question}</span>
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-transform duration-300 group-open:rotate-45">
                  <Plus className="size-4" />
                </span>
              </summary>
              <p className="mt-3 max-w-2xl text-pretty leading-relaxed text-muted-foreground">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
