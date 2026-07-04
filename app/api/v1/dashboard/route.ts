import { defineRoute } from '@/server/http/handler'
import { DashboardService } from '@/server/services/dashboard.service'
import { dashboardQuerySchema, type DashboardQuery } from '@/lib/validation/common.schema'
import type { DashboardSummaryDTO } from '@/lib/dto/dashboard.dto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/v1/dashboard — the entire dashboard payload (KPIs, revenue series, status
 * breakdown, recent documents, recent activity, totals) from live Prisma aggregations.
 * Any workspace member may read it.
 */
export const GET = defineRoute<DashboardSummaryDTO, undefined, DashboardQuery>({
  requireMembership: true,
  schema: { query: dashboardQuerySchema },
  handler: ({ query, ctx }) => new DashboardService(ctx).summary(query.months),
})
