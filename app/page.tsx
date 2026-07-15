import type { Metadata } from 'next'
import { SiteHeader } from '@/components/marketing/site-header'
import { Hero } from '@/components/marketing/hero'
import { Stats } from '@/components/marketing/social-proof'
import { FeaturedTools } from '@/components/marketing/featured-tools'
import { WhyChoose } from '@/components/marketing/why-choose'
import { ProductShowcase } from '@/components/marketing/product-showcase'
import { TemplatesShowcase } from '@/components/marketing/templates-showcase'
import { HowItWorks } from '@/components/marketing/how-it-works'
import { PricingPreview } from '@/components/marketing/pricing-preview'
import { Faq } from '@/components/marketing/faq'
import { Cta } from '@/components/marketing/cta'
import { SiteFooter } from '@/components/marketing/site-footer'
import { LatestPosts } from '@/components/marketing/latest-posts'
import { JsonLd } from '@/components/seo/json-ld'
import { organizationSchema, websiteSchema, webApplicationSchema } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Bill Maker — Professional Invoice Generator',
  description:
    'Bill Maker is a free, professional invoice generator. Create GST-ready, multi-currency invoices online, download a print-ready PDF, send them, and track payments — in seconds.',
  keywords: [
    'invoice generator',
    'free invoice generator',
    'create invoice online',
    'gst invoice',
    'invoice maker',
    'invoice pdf',
  ],
  openGraph: {
    title: 'Bill Maker — Professional Invoice Generator',
    description: 'Create free, GST-ready, professional invoices online and download a PDF in seconds.',
    type: 'website',
    url: 'https://bill-maker.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bill Maker — Professional Invoice Generator',
    description: 'Create free, GST-ready, professional invoices online and download a PDF in seconds.',
  },
  robots: 'index, follow',
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <JsonLd data={[organizationSchema(), websiteSchema(), webApplicationSchema()]} />
      <SiteHeader />
      <main>
        <Hero />
        <FeaturedTools />
        <Stats />
        <WhyChoose />
        <ProductShowcase />
        <TemplatesShowcase />
        <HowItWorks />
        <PricingPreview />
        <LatestPosts />
        <Faq />
        <Cta />
      </main>
      <SiteFooter />
    </div>
  )
}
