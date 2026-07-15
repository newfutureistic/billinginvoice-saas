import { BlogRepository } from '@/server/repositories/blog.repository'
import { toBlogDTO, toBlogListItemDTO, type BlogPostDTO, type BlogListItemDTO } from '@/lib/dto/blog.dto'
import { NotFoundError } from '@/server/errors/app-error'
import type { BlogCreateInput, BlogUpdateInput, BlogListQuery } from '@/lib/validation/blog.schema'
import type { BlogPost } from '@prisma/client'

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 120) || 'post'
}

function readingMinutes(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

export interface BlogAuthor {
  id?: string
  name?: string | null
}

export interface PaginatedBlog<T> {
  items: T[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

/**
 * Blog CMS service (Mission 3). Site-global content; admin writes are gated by RBAC at the
 * route. Handles slug generation/uniqueness, reading-time, and publish transitions.
 */
export class BlogService {
  private readonly repo = new BlogRepository()

  private async uniqueSlug(desired: string, excludeId?: string): Promise<string> {
    const base = slugify(desired)
    let slug = base
    for (let i = 2; i < 100; i++) {
      const existing = await this.repo.findBySlug(slug)
      if (!existing || existing.id === excludeId) return slug
      slug = `${base}-${i}`
    }
    return `${base}-${Date.now()}`
  }

  async create(input: BlogCreateInput, author: BlogAuthor): Promise<BlogPostDTO> {
    const slug = await this.uniqueSlug(input.slug || input.title)
    const publish = input.status === 'PUBLISHED'
    const created = await this.repo.create({
      slug,
      title: input.title,
      excerpt: input.excerpt || null,
      content: input.content,
      coverImage: input.coverImage || null,
      coverAlt: input.coverAlt || null,
      category: input.category,
      tags: input.tags,
      authorId: author.id ?? null,
      authorName: input.authorName || author.name || 'Bill Maker',
      status: input.status,
      featured: input.featured,
      pinned: input.pinned,
      readingMinutes: readingMinutes(input.content),
      metaTitle: input.metaTitle || null,
      metaDescription: input.metaDescription || null,
      canonicalUrl: input.canonicalUrl || null,
      scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
      publishedAt: publish ? new Date() : null,
    })
    return toBlogDTO(created)
  }

  async update(id: string, input: BlogUpdateInput): Promise<BlogPostDTO> {
    const current = await this.repo.findById(id)
    if (!current) throw new NotFoundError('BlogPost', { id })

    const data: Record<string, unknown> = {}
    if (input.title !== undefined) data.title = input.title
    if (input.slug !== undefined) data.slug = await this.uniqueSlug(input.slug, id)
    if (input.excerpt !== undefined) data.excerpt = input.excerpt || null
    if (input.content !== undefined) {
      data.content = input.content
      data.readingMinutes = readingMinutes(input.content)
    }
    if (input.coverImage !== undefined) data.coverImage = input.coverImage || null
    if (input.coverAlt !== undefined) data.coverAlt = input.coverAlt || null
    if (input.category !== undefined) data.category = input.category
    if (input.tags !== undefined) data.tags = input.tags
    if (input.authorName !== undefined) data.authorName = input.authorName
    if (input.featured !== undefined) data.featured = input.featured
    if (input.pinned !== undefined) data.pinned = input.pinned
    if (input.metaTitle !== undefined) data.metaTitle = input.metaTitle || null
    if (input.metaDescription !== undefined) data.metaDescription = input.metaDescription || null
    if (input.canonicalUrl !== undefined) data.canonicalUrl = input.canonicalUrl || null
    if (input.scheduledAt !== undefined) data.scheduledAt = input.scheduledAt ? new Date(input.scheduledAt) : null
    if (input.status !== undefined) {
      data.status = input.status
      // Stamp publishedAt the first time it goes live; clear it when unpublished.
      if (input.status === 'PUBLISHED' && !current.publishedAt) data.publishedAt = new Date()
      if (input.status === 'DRAFT') data.publishedAt = null
    }

    const updated = await this.repo.update(id, data)
    return toBlogDTO(updated)
  }

  async softDelete(id: string): Promise<BlogPostDTO> {
    const current = await this.repo.findById(id)
    if (!current) throw new NotFoundError('BlogPost', { id })
    return toBlogDTO(await this.repo.update(id, { deletedAt: new Date() }))
  }

  async restore(id: string): Promise<BlogPostDTO> {
    const current = await this.repo.findById(id)
    if (!current) throw new NotFoundError('BlogPost', { id })
    return toBlogDTO(await this.repo.update(id, { deletedAt: null }))
  }

  async adminList(query: BlogListQuery): Promise<PaginatedBlog<BlogListItemDTO>> {
    const { items, total } = await this.repo.list({ ...query, includeDeleted: query.includeDeleted ?? true })
    return this.paginate(items.map(toBlogListItemDTO), query.page, query.pageSize, total)
  }

  async publicList(query: Omit<BlogListQuery, 'status' | 'includeDeleted'>): Promise<PaginatedBlog<BlogListItemDTO>> {
    const { items, total } = await this.repo.list({ ...query, publishedOnly: true })
    return this.paginate(items.map(toBlogListItemDTO), query.page, query.pageSize, total)
  }

  async getBySlug(id: string): Promise<BlogPostDTO | null> {
    const p = await this.repo.findById(id)
    return p ? toBlogDTO(p) : null
  }

  async getPublished(slug: string): Promise<{
    post: BlogPostDTO
    related: BlogListItemDTO[]
    prev: BlogListItemDTO | null
    next: BlogListItemDTO | null
  } | null> {
    const post = await this.repo.findPublishedBySlug(slug)
    if (!post) return null
    const [related, { prev, next }] = await Promise.all([this.repo.related(post, 3), this.repo.prevNext(post)])
    return {
      post: toBlogDTO(post),
      related: related.map(toBlogListItemDTO),
      prev: prev ? toBlogListItemDTO(prev) : null,
      next: next ? toBlogListItemDTO(next) : null,
    }
  }

  async latest(take = 3): Promise<BlogListItemDTO[]> {
    return (await this.repo.latestPublished(take)).map(toBlogListItemDTO)
  }

  async categories(): Promise<string[]> {
    return this.repo.distinctCategories()
  }

  async publishedSlugs(): Promise<{ slug: string; updatedAt: Date }[]> {
    return this.repo.allPublishedSlugs()
  }

  private paginate<T>(items: T[], page: number, pageSize: number, total: number): PaginatedBlog<T> {
    return { items, page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) }
  }
}
