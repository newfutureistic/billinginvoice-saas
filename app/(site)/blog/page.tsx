import type { Metadata } from 'next'
import { PageHero } from '@/components/site/page-hero'
import { Newsletter } from '@/components/site/newsletter'
import { BlogListing } from '@/components/site/blog-listing'
import { blogPosts } from '@/lib/site-data'

export const metadata: Metadata = {
  title: 'Blog — ToolForge',
  description:
    'Practical guides on invoicing, taxes, freelancing, and running a tidy business — from the ToolForge team.',
}

export default function BlogPage() {
  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="The paperwork playbook"
        description="Hard-won lessons on getting paid, staying tax-ready, and building a business that runs itself."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Blog' }]}
      />
      <BlogListing posts={blogPosts} />
      <Newsletter />
    </>
  )
}
