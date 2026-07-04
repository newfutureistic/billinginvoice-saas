import { defineRoute } from '@/server/http/handler'
import { AuditLogRepository } from '@/server/repositories/audit-log.repository'
import { paginationQuerySchema, type PaginationQuery } from '@/lib/validation/common.schema'
import { toAuditDTO, type AuditOutputDTO } from '@/lib/dto/activity.dto'
import type { ListResult } from '@/server/http/response'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/v1/audit — the workspace audit log (Mission 5 §10). Gated by `audit:read`
 * (OWNER/ADMIN); before/after snapshots are already secret-redacted at write time.
 */
export const GET = defineRoute<ListResult<AuditOutputDTO>, undefined, PaginationQuery>({
  permission: 'audit:read',
  schema: { query: paginationQuerySchema },
  handler: async ({ query, ctx }) => {
    const page = await new AuditLogRepository().listByWorkspace(ctx.workspaceId as string, {
      page: query.page,
      pageSize: query.pageSize,
    })
    return { items: page.data.map(toAuditDTO), pagination: page.meta }
  },
})
