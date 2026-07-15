import { PricingPlans } from '@/components/site/pricing-plans'

export function PricingPreview() {
  return (
    <section id="pricing" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20 lg:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-brand">Pricing</p>
        <h2 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.02em] text-foreground lg:text-4xl">
          Free today — no subscription
        </h2>
        <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
          Bill Maker is free to use. No credit card, no subscription, and no per-invoice charges. Paid plans are
          planned for the future.
        </p>
      </div>

      <div className="mt-14">
        <PricingPlans />
      </div>
    </section>
  )
}
