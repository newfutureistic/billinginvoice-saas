import type { Metadata } from 'next'
import { SiteHeader } from '@/components/marketing/site-header'
import { Hero } from '@/components/marketing/hero'
import { TrustLogos, Stats } from '@/components/marketing/social-proof'
import { FeaturedTools } from '@/components/marketing/featured-tools'
import { ToolCategories } from '@/components/marketing/tool-categories'
import { WhyChoose } from '@/components/marketing/why-choose'
import { TemplatesShowcase } from '@/components/marketing/templates-showcase'
import { PricingPreview } from '@/components/marketing/pricing-preview'
import { Testimonials } from '@/components/marketing/testimonials'
import { Faq } from '@/components/marketing/faq'
import { Cta } from '@/components/marketing/cta'
import { SiteFooter } from '@/components/marketing/site-footer'

export const metadata: Metadata = {
  title: 'ToolForge — Professional invoices, generated in seconds',
  description:
    'ToolForge is the operating system for your business paperwork. Create tax-ready invoices, quotes, and contracts in seconds — then send, track, and get paid. 40+ tools, one workspace.',
  keywords: ['invoice', 'invoicing', 'quotes', 'contracts', 'business tools', 'SaaS'],
  openGraph: {
    title: 'ToolForge — Professional invoices, generated in seconds',
    description: 'Create tax-ready invoices in seconds with ToolForge',
    type: 'website',
    url: 'https://toolforge.app',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ToolForge — Professional invoices, generated in seconds',
    description: 'Create tax-ready invoices in seconds with ToolForge',
  },
  robots: 'index, follow',
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <Hero />
        <TrustLogos />
        <FeaturedTools />
        <Stats />
        <ToolCategories />
        <WhyChoose />
        <TemplatesShowcase />
        <PricingPreview />
        <Testimonials />
        <Faq />
        <Cta />
      </main>
      <SiteFooter />
    </div>
  )
}
