import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Breadcrumbs } from '@/components/site/breadcrumbs'
import { JsonLd } from '@/components/seo/json-ld'
import { buildMetadata, articleSchema, breadcrumbSchema } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'The Complete Guide to Invoices',
  description:
    'A complete, practical guide to invoices: what an invoice is, how to create one, GST and international invoices, invoice numbers, payment terms, common mistakes, and best practices.',
  path: '/invoice-guide',
  type: 'article',
  keywords: [
    'what is an invoice',
    'how to create an invoice',
    'gst invoice',
    'business invoice',
    'international invoice',
    'invoice payment terms',
    'invoice number format',
  ],
})

const sections = [
  { id: 'what-is-an-invoice', label: 'What is an invoice' },
  { id: 'what-to-include', label: 'What to include' },
  { id: 'how-to-create', label: 'How to create an invoice' },
  { id: 'invoice-number', label: 'Invoice numbers' },
  { id: 'payment-terms', label: 'Payment terms' },
  { id: 'gst-invoice', label: 'GST invoices' },
  { id: 'business-invoice', label: 'Business invoices' },
  { id: 'international-invoice', label: 'International invoices' },
  { id: 'common-mistakes', label: 'Common mistakes' },
  { id: 'best-practices', label: 'Best practices' },
]

const P = 'mt-4 text-pretty leading-relaxed text-muted-foreground'
const H2 = 'mt-14 scroll-mt-24 text-2xl font-semibold tracking-[-0.02em] text-foreground lg:text-3xl'
const H3 = 'mt-8 text-lg font-semibold tracking-[-0.01em] text-foreground'
const UL = 'mt-4 space-y-2 text-pretty leading-relaxed text-muted-foreground'

export default function InvoiceGuidePage() {
  return (
    <>
      <JsonLd
        data={articleSchema({
          title: 'The Complete Guide to Invoices',
          description:
            'A complete, practical guide to invoices: what an invoice is, how to create one, GST and international invoices, invoice numbers, payment terms, common mistakes, and best practices.',
          path: '/invoice-guide',
          datePublished: '2026-07-09',
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Invoice Guide', path: '/invoice-guide' },
        ])}
      />

      <section className="border-b border-border bg-secondary/30">
        <div className="mx-auto max-w-3xl px-6 py-12 lg:py-16">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Invoice Guide' }]} />
          <h1 className="mt-10 text-balance text-4xl font-semibold tracking-[-0.025em] text-foreground lg:text-5xl">
            The complete guide to invoices
          </h1>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            Everything a freelancer, small business, or finance team needs to create clear, compliant invoices that
            get paid on time — with worked examples for GST, business, and international billing.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-6 py-12 lg:py-16">
        <nav aria-label="On this page" className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">On this page</h2>
          <ol className="mt-4 grid gap-2 sm:grid-cols-2">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-sm text-brand hover:underline">
                  {i + 1}. {s.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="mt-4">
          <h2 id="what-is-an-invoice" className={H2}>
            What is an invoice?
          </h2>
          <p className={P}>
            An invoice is a commercial document that a seller issues to a buyer to request payment for goods or
            services. It records exactly what was sold, how much it cost, any taxes that apply, the total amount due,
            and the terms under which payment is expected. In accounting terms it is both a request for payment and a
            legal record of a transaction — the paper trail that ties an order to the money that changes hands.
          </p>
          <p className={P}>
            Invoices matter for three reasons. First, they get you paid: a clear invoice with a due date and payment
            instructions removes friction and ambiguity. Second, they keep you compliant: tax authorities require
            businesses to issue and retain invoices, and registered businesses must show tax details on them. Third,
            they create a reliable record: when you reconcile your books, chase a late payment, or file taxes, the
            invoice is the source of truth for what was agreed.
          </p>
          <p className={P}>
            An invoice is different from a few documents it is often confused with. A <strong>quote</strong> or{' '}
            <strong>estimate</strong> is sent before work begins to propose a price. A <strong>purchase order</strong>{' '}
            is sent by the buyer to authorise a purchase. A <strong>receipt</strong> is issued after payment as proof
            that the money was received. The invoice sits in the middle: it is issued after the work or delivery but
            before payment, and it is the document that actually asks for the money.
          </p>

          <h2 id="what-to-include" className={H2}>
            What to include on an invoice
          </h2>
          <p className={P}>
            While formats vary by country and industry, almost every valid invoice contains the same core elements. A
            missing field is the most common reason an invoice is queried or delayed, so treat this as a checklist:
          </p>
          <ul className={UL}>
            <li>• The word &ldquo;Invoice&rdquo; so it is unambiguous what the document is.</li>
            <li>• A unique invoice number for tracking and audit.</li>
            <li>• The issue date and the payment due date.</li>
            <li>• Your business name, address, and contact details (and logo, if branding matters).</li>
            <li>• The client&rsquo;s name and billing address.</li>
            <li>• A clear description of each item or service, with quantity and unit price.</li>
            <li>• The subtotal, any discounts, taxes (with rate), and the grand total.</li>
            <li>• Your tax registration number if you are tax-registered (for example a GSTIN or VAT number).</li>
            <li>• Payment terms and accepted payment methods or bank details.</li>
          </ul>
          <p className={P}>
            Optional but valuable additions include a purchase-order reference, notes or thank-you text, a late-payment
            policy, and shipping details for physical goods. The rule of thumb is that anyone reading the invoice —
            your client, their accountant, or a tax officer — should be able to understand the transaction without
            asking you a single question.
          </p>

          <h2 id="how-to-create" className={H2}>
            How to create an invoice, step by step
          </h2>
          <p className={P}>
            Creating an invoice is straightforward once you have a template or a generator that handles the maths.
            Here is the process Bill Maker&rsquo;s free invoice generator follows:
          </p>
          <h3 className={H3}>1. Add your business details</h3>
          <p className={P}>
            Start with who is billing. Enter your business name, address, contact information, and — if you are
            registered — your tax number. Add a logo and accent colour if you want the invoice to look on-brand. Save
            this once and it is reused on every future invoice.
          </p>
          <h3 className={H3}>2. Add the client</h3>
          <p className={P}>
            Enter the client&rsquo;s name, billing address, and email. Accurate client details matter: an invoice
            addressed to the wrong legal entity can be rejected by the client&rsquo;s accounts department.
          </p>
          <h3 className={H3}>3. List your line items</h3>
          <p className={P}>
            Add each product or service on its own line with a clear description, the quantity, and the unit price.
            Specific descriptions (&ldquo;Website design — 12 hours&rdquo;) beat vague ones (&ldquo;Services&rdquo;)
            and reduce back-and-forth. The line total and running subtotal calculate automatically.
          </p>
          <h3 className={H3}>4. Apply taxes, discounts, and charges</h3>
          <p className={P}>
            Set the tax rate that applies (for example 18% GST or 20% VAT) and choose whether prices are tax-inclusive
            or tax-exclusive. Add any discount or extra charges such as shipping. The generator recomputes the
            subtotal, tax, and grand total instantly so the numbers are always correct.
          </p>
          <h3 className={H3}>5. Set the number, dates, and terms</h3>
          <p className={P}>
            Confirm the invoice number, issue date, and due date, and state your payment terms and how you want to be
            paid. Then download the invoice as a PDF, or save it to your workspace to send, track, and collect payment
            online.
          </p>

          <h2 id="invoice-number" className={H2}>
            Invoice numbers
          </h2>
          <p className={P}>
            Every invoice needs a unique identifier, and in most tax systems that number must be sequential — you
            cannot skip or reuse numbers, because gaps suggest missing or hidden transactions. A good invoice number is
            short, ordered, and human-readable.
          </p>
          <p className={P}>
            A widely used pattern is a prefix, an optional year, and a running counter, for example{' '}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">INV-2024-001</code>. The prefix labels
            the document type, the year helps you file, and the counter guarantees uniqueness. Some businesses add a
            client or project code. Whatever scheme you pick, apply it consistently and never issue two invoices with
            the same number. Bill Maker suggests the next number automatically and lets you customise the prefix and
            starting value so your sequence stays clean.
          </p>

          <h2 id="payment-terms" className={H2}>
            Payment terms
          </h2>
          <p className={P}>
            Payment terms tell the client when and how to pay. Stating them clearly is one of the highest-leverage
            things you can do to get paid on time. Common terms include:
          </p>
          <ul className={UL}>
            <li>
              • <strong>Due on receipt</strong> — payment is expected immediately.
            </li>
            <li>
              • <strong>Net 7 / Net 15 / Net 30</strong> — payment is due within 7, 15, or 30 days of the invoice
              date.
            </li>
            <li>
              • <strong>Net 60 / Net 90</strong> — longer terms sometimes required by large clients.
            </li>
            <li>
              • <strong>Milestone or deposit</strong> — a percentage up front and the balance on completion.
            </li>
          </ul>
          <p className={P}>
            Shorter terms protect your cash flow, while longer terms can win larger accounts — choose based on your
            relationship and how much runway you have. Always include the exact due date (not just &ldquo;Net
            30&rdquo;), the accepted payment methods, and any late-payment fee. If you offer online payment, a single
            &ldquo;Pay now&rdquo; link removes almost all of the friction that causes late payments.
          </p>

          <h2 id="gst-invoice" className={H2}>
            GST invoices
          </h2>
          <p className={P}>
            A GST invoice is a tax invoice that complies with Goods and Services Tax rules, used in India and several
            other countries. If you are GST-registered you must issue a compliant tax invoice for taxable supplies. In
            addition to the standard fields, a GST invoice must show:
          </p>
          <ul className={UL}>
            <li>• Your GSTIN and, for business customers, the recipient&rsquo;s GSTIN.</li>
            <li>• A consecutive invoice number and the date of issue.</li>
            <li>• The HSN code for goods or the SAC code for services.</li>
            <li>• The taxable value of each item.</li>
            <li>
              • The tax split — CGST and SGST for sales within a state, or IGST for inter-state sales — with the rate
              and amount shown separately.
            </li>
            <li>• The place of supply for inter-state transactions.</li>
          </ul>
          <p className={P}>
            The key idea is that the tax must be transparent: the buyer needs to see exactly how much GST was charged
            and under which heads, because they may claim it as input tax credit. Bill Maker lets you capture GST
            details and calculates the tax automatically so the split is always correct.
          </p>

          <h2 id="business-invoice" className={H2}>
            Business invoices
          </h2>
          <p className={P}>
            A business invoice is simply an invoice issued in the course of running a company, and the emphasis is on
            professionalism and consistency. Businesses often bill the same clients repeatedly, so speed and accuracy
            matter. A few practices set business invoices apart:
          </p>
          <ul className={UL}>
            <li>• Consistent branding — logo, colours, and layout that reflect the company.</li>
            <li>• Reusable clients and products so recurring invoices take seconds.</li>
            <li>• Clear references to purchase orders or contracts when the client requires them.</li>
            <li>• Saved records for reconciliation, reporting, and audits.</li>
          </ul>
          <p className={P}>
            For recurring work, duplicating a previous invoice and changing the dates is far faster than starting from
            scratch. Keeping every invoice in one workspace also means you can see, at a glance, what has been paid,
            what is outstanding, and what is overdue.
          </p>

          <h2 id="international-invoice" className={H2}>
            International invoices
          </h2>
          <p className={P}>
            Billing a client in another country adds a few considerations on top of a standard invoice. The most
            important is currency: state the invoice currency clearly and apply it consistently across line items and
            totals. Decide in advance whether you or the client absorbs exchange-rate fluctuations, and consider noting
            the exchange rate if your accounting requires it.
          </p>
          <p className={P}>
            Cross-border tax treatment differs from domestic sales — many exports of services are zero-rated or
            outside the scope of local sales tax, but the rules depend on both countries, so confirm your obligations.
            Include both parties&rsquo; full legal names and addresses, any tax identifiers, and clear payment
            instructions that work internationally, such as SWIFT/IBAN details or an online payment link. Bill Maker
            supports multiple currencies including USD, EUR, GBP, INR, AED, SGD, and CHF, so the same generator handles
            local and international billing.
          </p>

          <h2 id="common-mistakes" className={H2}>
            Common invoicing mistakes
          </h2>
          <p className={P}>
            Most payment delays trace back to a small number of avoidable errors. Watch for these:
          </p>
          <ul className={UL}>
            <li>• Missing or duplicate invoice numbers, which break your audit trail.</li>
            <li>• No due date or vague terms, so the client has no deadline to work to.</li>
            <li>• Incorrect tax rates or forgetting to show tax separately.</li>
            <li>• Vague line items that invite questions and disputes.</li>
            <li>• Wrong client details or billing the wrong legal entity.</li>
            <li>• Maths errors from manual totalling.</li>
            <li>• No copy kept for your own records.</li>
            <li>• Sending the invoice late — the clock only starts when the client receives it.</li>
          </ul>
          <p className={P}>
            Almost all of these disappear when you use a generator that enforces unique numbers, calculates tax and
            totals automatically, and stores a copy of every invoice you create.
          </p>

          <h2 id="best-practices" className={H2}>
            Invoicing best practices
          </h2>
          <p className={P}>
            To turn invoicing from a chore into a reliable part of getting paid, adopt a few habits:
          </p>
          <ul className={UL}>
            <li>• Invoice promptly — send the invoice as soon as the work is done or the goods ship.</li>
            <li>• Be specific — detailed descriptions reduce disputes and speed approval.</li>
            <li>• Make payment easy — include an online payment link and clear instructions.</li>
            <li>• Set expectations — state terms, due dates, and any late fees up front.</li>
            <li>• Follow up — send a polite reminder before and after the due date.</li>
            <li>• Stay consistent — use the same template, numbering, and branding every time.</li>
            <li>• Keep records — store every invoice and receipt so reconciliation and tax filing are painless.</li>
          </ul>
          <p className={P}>
            Do these consistently and you will spend less time chasing payments and more time on the work that
            actually earns them.
          </p>

          <div className="mt-14 flex flex-col items-start gap-4 rounded-2xl border border-border bg-card p-8 shadow-token-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-[-0.01em] text-foreground">Create your invoice now</h2>
              <p className="mt-1 text-pretty leading-relaxed text-muted-foreground">
                Put this guide into practice with the free invoice generator.
              </p>
            </div>
            <Link
              href="/invoice/new"
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-token-sm transition-colors hover:bg-primary/90"
            >
              Open the generator
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <p className="mt-8 text-sm text-muted-foreground">
            Have a specific question? Browse the{' '}
            <Link href="/faq" className="font-medium text-brand hover:underline">
              invoicing FAQ
            </Link>
            .
          </p>
        </article>
      </div>
    </>
  )
}
