import { z } from 'zod'
import { defineRoute } from '@/server/http/handler'
import { BlogService } from '@/server/services/blog.service'
import { assertSiteAdmin } from '@/server/auth/site-admin'
import { idSchema } from '@/lib/validation/common.schema'
import type { BlogPostDTO } from '@/lib/dto/blog.dto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const paramsSchema = z.object({ id: idSchema })
type Params = z.infer<typeof paramsSchema>

/** POST /api/v1/blog/:id/restore — restore a soft-deleted post (site admin only). */
export const POST = defineRoute<BlogPostDTO, undefined, undefined, Params>({
  permission: 'blog:manage',
  schema: { params: paramsSchema },
  csrf: true,
  handler: ({ params, ctx }) => {
    assertSiteAdmin(ctx, 'Blog management')
    return new BlogService().restore(params.id)
  },
})
