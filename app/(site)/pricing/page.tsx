import type { Metadata } from 'next'
import { PageHero } from '@/components/site/page-hero'
import { PricingPlans } from '@/components/site/pricing-plans'
import { Faq } from '@/components/marketing/faq'

export const metadata: Metadata = {
  title: 'Pricing — ToolForge',
  description:
    'Simple, transparent pricing. Start free, upgrade when you grow. Every plan includes unlimited tools and tax-ready exports.',
}

export default function PricingPage() {
  return (
    <>
      <PageHero
        eyebrow="Pricing"
        title="Priced for the whole journey"
        description="Start free and generate your first documents in seconds. Upgrade only when your business needs branding, automation, and a team."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Pricing' }]}
      />
      <PricingPlans />
      <Faq />
    </>
  )
}
