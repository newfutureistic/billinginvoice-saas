import { Prisma, type BlogPost } from '@prisma/client'
import { prisma } from '@/server/db/prisma'

/**
 * Data access for the site-global blog (Mission 3). Unlike documents/clients this is NOT
 * tenant-scoped — there is one public blog for bill-maker.com — so it uses the Prisma client
 * directly. Admin writes are gated by RBAC at the API layer.
 */
export type BlogCreateData = Prisma.BlogPostUncheckedCreateInput
export type BlogUpdateData = Prisma.BlogPostUncheckedUpdateInput

export interface BlogListParams {
  page: number
  pageSize: number
  status?: 'DRAFT' | 'PUBLISHED'
  category?: string
  tag?: string
  q?: string
  includeDeleted?: boolean
  publishedOnly?: boolean
}

function buildWhere(p: BlogListParams): Prisma.BlogPostWhereInput {
  const where: Prisma.BlogPostWhereInput = {}
  if (!p.includeDeleted) where.deletedAt = null
  if (p.publishedOnly) {
    where.status = 'PUBLISHED'
    where.publishedAt = { lte: new Date() }
  } else if (p.status) {
    where.status = p.status
  }
  if (p.category) where.category = p.category
  if (p.tag) where.tags = { has: p.tag }
  if (p.q) {
    where.OR = [
      { title: { contains: p.q, mode: 'insensitive' } },
      { excerpt: { contains: p.q, mode: 'insensitive' } },
      { content: { contains: p.q, mode: 'insensitive' } },
    ]
  }
  return where
}

export class BlogRepository {
  create(data: BlogCreateData): Promise<BlogPost> {
    return prisma.blogPost.create({ data })
  }

  update(id: string, data: BlogUpdateData): Promise<BlogPost> {
    return prisma.blogPost.update({ where: { id }, data })
  }

  findById(id: string): Promise<BlogPost | null> {
    return prisma.blogPost.findUnique({ where: { id } })
  }

  findBySlug(slug: string): Promise<BlogPost | null> {
    return prisma.blogPost.findUnique({ where: { slug } })
  }

  findPublishedBySlug(slug: string): Promise<BlogPost | null> {
    return prisma.blogPost.findFirst({
      where: { slug, status: 'PUBLISHED', deletedAt: null, publishedAt: { lte: new Date() } },
    })
  }

  async list(p: BlogListParams): Promise<{ items: BlogPost[]; total: number }> {
    const where = buildWhere(p)
    const [items, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        orderBy: [{ pinned: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
        skip: (p.page - 1) * p.pageSize,
        take: p.pageSize,
      }),
      prisma.blogPost.count({ where }),
    ])
    return { items, total }
  }

  latestPublished(take: number): Promise<BlogPost[]> {
    return prisma.blogPost.findMany({
      where: { status: 'PUBLISHED', deletedAt: null, publishedAt: { lte: new Date() } },
      orderBy: [{ pinned: 'desc' }, { publishedAt: 'desc' }],
      take,
    })
  }

  featuredPublished(take: number): Promise<BlogPost[]> {
    return prisma.blogPost.findMany({
      where: { status: 'PUBLISHED', deletedAt: null, featured: true, publishedAt: { lte: new Date() } },
      orderBy: { publishedAt: 'desc' },
      take,
    })
  }

  related(post: BlogPost, take: number): Promise<BlogPost[]> {
    return prisma.blogPost.findMany({
      where: {
        id: { not: post.id },
        status: 'PUBLISHED',
        deletedAt: null,
        publishedAt: { lte: new Date() },
        OR: [{ category: post.category }, { tags: { hasSome: post.tags } }],
      },
      orderBy: { publishedAt: 'desc' },
      take,
    })
  }

  async prevNext(post: BlogPost): Promise<{ prev: BlogPost | null; next: BlogPost | null }> {
    const anchor = post.publishedAt ?? post.createdAt
    const [prev, next] = await Promise.all([
      prisma.blogPost.findFirst({
        where: { status: 'PUBLISHED', deletedAt: null, publishedAt: { lt: anchor } },
        orderBy: { publishedAt: 'desc' },
      }),
      prisma.blogPost.findFirst({
        where: { status: 'PUBLISHED', deletedAt: null, publishedAt: { gt: anchor, lte: new Date() } },
        orderBy: { publishedAt: 'asc' },
      }),
    ])
    return { prev, next }
  }

  async distinctCategories(): Promise<string[]> {
    const rows = await prisma.blogPost.findMany({
      where: { status: 'PUBLISHED', deletedAt: null },
      distinct: ['category'],
      select: { category: true },
      orderBy: { category: 'asc' },
    })
    return rows.map((r) => r.category)
  }

  allPublishedSlugs(): Promise<{ slug: string; updatedAt: Date }[]> {
    return prisma.blogPost.findMany({
      where: { status: 'PUBLISHED', deletedAt: null, publishedAt: { lte: new Date() } },
      select: { slug: true, updatedAt: true },
      orderBy: { publishedAt: 'desc' },
    })
  }
}
