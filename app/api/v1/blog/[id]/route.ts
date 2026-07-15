import { z } from 'zod'
import { defineRoute } from '@/server/http/handler'
import { BlogService } from '@/server/services/blog.service'
import { assertSiteAdmin } from '@/server/auth/site-admin'
import { blogUpdateSchema, type BlogUpdateInput } from '@/lib/validation/blog.schema'
import { idSchema } from '@/lib/validation/common.schema'
import type { BlogPostDTO } from '@/lib/dto/blog.dto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const paramsSchema = z.object({ id: idSchema })
type Params = z.infer<typeof paramsSchema>

/** GET /api/v1/blog/:id — fetch one post (site admin, any status). */
export const GET = defineRoute<BlogPostDTO | null, undefined, undefined, Params>({
  permission: 'blog:manage',
  schema: { params: paramsSchema },
  handler: ({ params, ctx }) => {
    assertSiteAdmin(ctx)
    return new BlogService().getBySlug(params.id)
  },
})

/** PATCH /api/v1/blog/:id — update / publish / unpublish / feature / pin (site admin only). */
export const PATCH = defineRoute<BlogPostDTO, BlogUpdateInput, undefined, Params>({
  permission: 'blog:manage',
  schema: { params: paramsSchema, body: blogUpdateSchema },
  csrf: true,
  handler: ({ params, body, ctx }) => {
    assertSiteAdmin(ctx)
    return new BlogService().update(params.id, body)
  },
})

/** DELETE /api/v1/blog/:id — soft delete (site admin only). */
export const DELETE = defineRoute<BlogPostDTO, undefined, undefined, Params>({
  permission: 'blog:manage',
  schema: { params: paramsSchema },
  csrf: true,
  handler: ({ params, ctx }) => {
    assertSiteAdmin(ctx)
    return new BlogService().softDelete(params.id)
  },
})
