import type { Metadata } from 'next'

/**
 * Central SEO configuration + helpers (SEO Phase 1). Pure/derived data only — no side effects,
 * no imports from server code — so it is safe to use from any Server Component's `metadata`
 * export. The canonical origin is read from env (falls back to the production domain) so
 * canonical URLs, Open Graph, and the sitemap all agree.
 */
const RAW_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.APP_URL ||
  process.env.AUTH_URL ||
  'https://bill-maker.com'

export const SITE = {
  name: 'Bill Maker',
  url: RAW_URL.replace(/\/+$/, ''),
  locale: 'en_US',
  twitter: '@billmaker',
  description:
    'Bill Maker is a free, professional invoice generator. Create GST-ready, multi-currency invoices online, download a print-ready PDF, and track payments — in seconds.',
} as const

/** Absolute URL for a site-relative path (`/faq` → `https://…/faq`). */
export function absoluteUrl(path = '/'): string {
  if (/^https?:\/\//.test(path)) return path
  return `${SITE.url}${path.startsWith('/') ? '' : '/'}${path}`
}

export interface PageSeo {
  title: string
  description: string
  /** Site-relative path used for the canonical URL + OG url (e.g. `/faq`). */
  path: string
  /** Set false for pages that should not be indexed. */
  index?: boolean
  keywords?: string[]
  type?: 'website' | 'article'
}

/**
 * Build a complete Next `Metadata` object with a canonical URL, Open Graph, and Twitter card.
 * Images are intentionally omitted here — the root `opengraph-image`/`twitter-image` file
 * conventions supply a branded 1200×630 image to every route automatically.
 */
export function buildMetadata({ title, description, path, index = true, keywords, type = 'website' }: PageSeo): Metadata {
  const canonical = path
  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    robots: index
      ? { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } }
      : { index: false, follow: false },
    openGraph: {
      type,
      url: absoluteUrl(path),
      siteName: SITE.name,
      locale: SITE.locale,
      title,
      description,
    },
    twitter: {
      card: 'summary_large_image',
      site: SITE.twitter,
      creator: SITE.twitter,
      title,
      description,
    },
  }
}

/* ---------------------------------------------------------------------------------------------
 * JSON-LD structured-data builders. Each returns a plain object rendered by <JsonLd/>.
 * ------------------------------------------------------------------------------------------- */

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.name,
    url: SITE.url,
    logo: absoluteUrl('/icon.svg'),
    description: SITE.description,
    sameAs: ['https://twitter.com/billmaker'],
  }
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${SITE.url}/help?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function webApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: `${SITE.name} Invoice Generator`,
    url: absoluteUrl('/invoice'),
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description:
      'Free online invoice generator. Create professional, tax-ready invoices and download them as PDF in seconds — no signup required.',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    featureList: [
      'Free invoice generator',
      'GST / VAT tax support',
      'Multi-currency invoices',
      'PDF download',
      'Professional templates',
    ],
  }
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }
}

export function articleSchema({ title, description, path, datePublished }: { title: string; description: string; path: string; datePublished: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url: absoluteUrl(path),
    datePublished,
    dateModified: datePublished,
    author: { '@type': 'Organization', name: SITE.name },
    publisher: { '@type': 'Organization', name: SITE.name, logo: { '@type': 'ImageObject', url: absoluteUrl('/icon.svg') } },
  }
}
