import type { Metadata } from 'next'
import { PageHero } from '@/components/site/page-hero'
import { PricingPlans } from '@/components/site/pricing-plans'
import { Faq } from '@/components/marketing/faq'

export const metadata: Metadata = {
  title: 'Pricing — Bill Maker',
  description:
    'Bill Maker is free to use. Create 2 invoices without an account, then 100 per month after a free signup — no payment, no subscription. Paid plans are coming later.',
  alternates: { canonical: '/pricing' },
}

export default function PricingPage() {
  return (
    <>
      <PageHero
        eyebrow="Pricing"
        title="Free to use — no subscription"
        description="Create 2 invoices without an account. Sign up free for 100 invoices every month. No payment, no subscription, no per-invoice charges — paid plans are planned for the future."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Pricing' }]}
      />
      <div className="mx-auto max-w-6xl px-6 pb-20">
        <PricingPlans />
      </div>
      <Faq />
    </>
  )
}
