import type { MetadataRoute } from 'next'
import { SITE } from '@/lib/seo'

/**
 * /robots.txt — App Router convention. Public marketing + tool pages are crawlable; private
 * app surfaces (dashboard, API, onboarding, auth, ephemeral invoice preview) are disallowed.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/api/', '/onboarding/', '/auth/', '/invoice/preview', '/design-system'],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  }
}
