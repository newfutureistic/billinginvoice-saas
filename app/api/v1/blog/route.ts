import { defineRoute } from '@/server/http/handler'
import { BlogService, type PaginatedBlog } from '@/server/services/blog.service'
import { assertSiteAdmin } from '@/server/auth/site-admin'
import { blogCreateSchema, blogListQuerySchema, type BlogCreateInput, type BlogListQuery } from '@/lib/validation/blog.schema'
import type { BlogPostDTO, BlogListItemDTO } from '@/lib/dto/blog.dto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** GET /api/v1/blog — admin listing (all statuses, incl. soft-deleted) with filters. */
export const GET = defineRoute<PaginatedBlog<BlogListItemDTO>, undefined, BlogListQuery>({
  permission: 'blog:manage',
  schema: { query: blogListQuerySchema },
  handler: ({ query, ctx }) => {
    assertSiteAdmin(ctx, 'Blog management')
    return new BlogService().adminList(query)
  },
})

/** POST /api/v1/blog — create a post (site admin only). */
export const POST = defineRoute<BlogPostDTO, BlogCreateInput>({
  permission: 'blog:manage',
  schema: { body: blogCreateSchema },
  csrf: true,
  status: 201,
  handler: ({ body, ctx }) => {
    assertSiteAdmin(ctx, 'Blog management')
    return new BlogService().create(body, { id: ctx.user?.id, name: ctx.user?.name ?? null })
  },
})
