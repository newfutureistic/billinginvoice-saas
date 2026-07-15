import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus, ArrowRight } from 'lucide-react'
import { Breadcrumbs } from '@/components/site/breadcrumbs'
import { JsonLd } from '@/components/seo/json-ld'
import { buildMetadata, faqSchema, breadcrumbSchema } from '@/lib/seo'
import { invoiceFaqs } from '@/lib/faq-content'

export const metadata: Metadata = buildMetadata({
  title: 'Invoicing FAQ — Free Invoice Generator',
  description:
    'Answers to the most common invoicing questions: GST and VAT invoices, invoice numbers, payment terms, international currencies, receipts, proforma invoices, and more.',
  path: '/faq',
  keywords: ['invoice faq', 'gst invoice', 'vat invoice', 'invoice number', 'payment terms', 'proforma invoice'],
})

export default function FaqPage() {
  return (
    <>
      <JsonLd data={faqSchema(invoiceFaqs)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'FAQ', path: '/faq' },
        ])}
      />

      <section className="border-b border-border bg-secondary/30">
        <div className="mx-auto max-w-4xl px-6 py-12 lg:py-16">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'FAQ' }]} />
          <div className="mt-10 max-w-2xl">
            <h1 className="text-balance text-4xl font-semibold tracking-[-0.025em] text-foreground lg:text-5xl">
              Invoicing questions, answered
            </h1>
            <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
              Everything you need to know about creating invoices, taxes, payment terms, and getting paid — for
              freelancers, small businesses, and enterprises alike.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16 lg:py-20">
        <h2 className="sr-only">Frequently asked questions</h2>
        <dl className="divide-y divide-border border-y border-border">
          {invoiceFaqs.map((faq) => (
            <div key={faq.question} className="py-1">
              <details className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left">
                  <dt className="text-pretty text-lg font-medium text-foreground">{faq.question}</dt>
                  <span
                    className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-transform duration-300 group-open:rotate-45"
                    aria-hidden
                  >
                    <Plus className="size-4" />
                  </span>
                </summary>
                <dd className="mt-3 max-w-3xl text-pretty leading-relaxed text-muted-foreground">{faq.answer}</dd>
              </details>
            </div>
          ))}
        </dl>

        <div className="mt-12 flex flex-col items-start gap-4 rounded-2xl border border-border bg-card p-8 shadow-token-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-[-0.01em] text-foreground">Ready to create an invoice?</h2>
            <p className="mt-1 text-pretty leading-relaxed text-muted-foreground">
              Use the free invoice generator — no signup required.
            </p>
          </div>
          <Link
            href="/invoice/new"
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-token-sm transition-colors hover:bg-primary/90"
          >
            Create an invoice
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <p className="mt-8 text-sm text-muted-foreground">
          Want a deeper walkthrough? Read the{' '}
          <Link href="/invoice-guide" className="font-medium text-brand hover:underline">
            complete guide to invoices
          </Link>
          .
        </p>
      </section>
    </>
  )
}
