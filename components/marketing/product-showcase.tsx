import Image from 'next/image'
import { Check, Lock } from 'lucide-react'

const paymentPoints = [
  'See paid, pending, and overdue invoices at a glance',
  'Automatic receipts and payment confirmations',
  'UPI, card, and bank transfer references in one place',
]

/**
 * Product showcase — real Bill Maker screens.
 * Purely presentational: a framed dashboard screenshot and the mobile payment view.
 */
export function ProductShowcase() {
  return (
    <section className="border-t border-border bg-secondary/30">
      <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
        {/* Dashboard analytics — framed as a browser window */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-brand">Dashboard</p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.02em] text-foreground lg:text-4xl">
            Everything you bill, in one clear view
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            Track revenue, outstanding invoices, and your top clients at a glance. Bill Maker turns
            your paperwork into a live picture of your business.
          </p>
        </div>

        <div className="mt-12 overflow-hidden rounded-2xl border border-border bg-card shadow-token-xl">
          <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-2.5">
            <span className="flex gap-1.5" aria-hidden>
              <span className="size-2.5 rounded-full bg-destructive/40" />
              <span className="size-2.5 rounded-full bg-warning/50" />
              <span className="size-2.5 rounded-full bg-success/50" />
            </span>
            <span className="mx-auto inline-flex items-center gap-1.5 rounded-md bg-background px-3 py-1 text-[0.7rem] font-medium text-muted-foreground shadow-token-xs">
              <Lock className="size-3" aria-hidden />
              app.bill-maker.com/dashboard
            </span>
          </div>
          <Image
            src="/dashboard.png"
            alt="The Bill Maker dashboard showing revenue trends, recent invoices, and top clients"
            width={1536}
            height={1024}
            sizes="(min-width: 1024px) 1024px, 100vw"
            className="h-auto w-full"
          />
        </div>

        {/* Payment tracking — real mobile screen (asset already ships in a device frame) */}
        <div className="mt-20 grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="order-2 lg:order-1">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-brand">Payments</p>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.02em] text-foreground lg:text-4xl">
              Know the moment you get paid
            </h2>
            <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
              Every payment is logged with its method, reference, and a receipt your client can keep
              — so you always know exactly where each invoice stands.
            </p>
            <ul className="mt-8 space-y-3">
              {paymentPoints.map((p) => (
                <li key={p} className="flex items-start gap-3 text-sm text-foreground">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-success-muted text-success">
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="order-1 flex justify-center lg:order-2">
            <Image
              src="/payment.png"
              alt="A Bill Maker payment confirmation on a mobile phone, marked paid"
              width={887}
              height={1774}
              sizes="(min-width: 1024px) 300px, 60vw"
              className="h-auto w-full max-w-[280px] rounded-[2rem] drop-shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
