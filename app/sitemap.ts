import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/lib/seo'

/**
 * /sitemap.xml — App Router convention. Lists every indexable public URL. At this scale a
 * single sitemap is correct; Next automatically emits a sitemap *index* only once a site
 * exceeds 50,000 URLs (via `generateSitemaps`), which is not required here.
 */
type Freq = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'

const ROUTES: { path: string; priority: number; changeFrequency: Freq }[] = [
  { path: '/', priority: 1.0, changeFrequency: 'weekly' },
  { path: '/invoice', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/invoice/new', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/faq', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/invoice-guide', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/pricing', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/templates', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/about', priority: 0.5, changeFrequency: 'yearly' },
  { path: '/help', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/blog', priority: 0.5, changeFrequency: 'weekly' },
  { path: '/contact', priority: 0.4, changeFrequency: 'yearly' },
  { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/terms', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/refund-policy', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/cookie-policy', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/disclaimer', priority: 0.3, changeFrequency: 'yearly' },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date()
  const staticEntries: MetadataRoute.Sitemap = ROUTES.map((r) => ({
    url: absoluteUrl(r.path),
    lastModified,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }))

  // Every published blog post is added automatically.
  let blogEntries: MetadataRoute.Sitemap = []
  try {
    const { BlogService } = await import('@/server/services/blog.service')
    const posts = await new BlogService().publishedSlugs()
    blogEntries = posts.map((p) => ({
      url: absoluteUrl(`/blog/${p.slug}`),
      lastModified: p.updatedAt,
      changeFrequency: 'monthly',
      priority: 0.6,
    }))
  } catch {
    // DB unavailable during build/prerender — ship the static sitemap rather than fail.
  }

  return [...staticEntries, ...blogEntries]
}
