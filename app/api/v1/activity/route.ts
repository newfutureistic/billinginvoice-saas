import { defineRoute } from '@/server/http/handler'
import { ActivityRepository } from '@/server/repositories/activity.repository'
import { paginationQuerySchema, type PaginationQuery } from '@/lib/validation/common.schema'
import { toActivityDTO, type ActivityOutputDTO } from '@/lib/dto/activity.dto'
import type { ListResult } from '@/server/http/response'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/v1/activity — the workspace business activity timeline (Mission 5 §11).
 * Any member may read it; it is written automatically by every mutating service.
 */
export const GET = defineRoute<ListResult<ActivityOutputDTO>, undefined, PaginationQuery>({
  requireMembership: true,
  schema: { query: paginationQuerySchema },
  handler: async ({ query, ctx }) => {
    const page = await new ActivityRepository().listByWorkspace(ctx.workspaceId as string, {
      page: query.page,
      pageSize: query.pageSize,
    })
    return { items: page.data.map(toActivityDTO), pagination: page.meta }
  },
})
