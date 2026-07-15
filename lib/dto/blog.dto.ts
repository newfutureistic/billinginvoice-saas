import type { BlogPost } from '@prisma/client'

/** Public/admin representation of a blog post (dates serialized to ISO strings). */
export interface BlogPostDTO {
  id: string
  slug: string
  title: string
  excerpt: string | null
  content: string
  coverImage: string | null
  coverAlt: string | null
  category: string
  tags: string[]
  authorName: string
  status: 'DRAFT' | 'PUBLISHED'
  featured: boolean
  pinned: boolean
  readingMinutes: number
  metaTitle: string | null
  metaDescription: string | null
  canonicalUrl: string | null
  publishedAt: string | null
  scheduledAt: string | null
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

/** Lightweight card shape for listings (no full content). */
export type BlogListItemDTO = Omit<BlogPostDTO, 'content'>

export function toBlogDTO(p: BlogPost): BlogPostDTO {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    content: p.content,
    coverImage: p.coverImage,
    coverAlt: p.coverAlt,
    category: p.category,
    tags: p.tags,
    authorName: p.authorName,
    status: p.status,
    featured: p.featured,
    pinned: p.pinned,
    readingMinutes: p.readingMinutes,
    metaTitle: p.metaTitle,
    metaDescription: p.metaDescription,
    canonicalUrl: p.canonicalUrl,
    publishedAt: p.publishedAt?.toISOString() ?? null,
    scheduledAt: p.scheduledAt?.toISOString() ?? null,
    deletedAt: p.deletedAt?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }
}

export function toBlogListItemDTO(p: BlogPost): BlogListItemDTO {
  const { content: _content, ...rest } = toBlogDTO(p)
  return rest
}
