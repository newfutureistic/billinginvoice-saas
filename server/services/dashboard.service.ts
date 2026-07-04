import { BaseService } from '@/server/services/base.service'
import { DashboardRepository, type MonthlyPoint } from '@/server/repositories/dashboard.repository'
import { ActivityRepository } from '@/server/repositories/activity.repository'
import { decimalToNumber, roundTo } from '@/server/utils/decimal'
import { toDocumentDTO } from '@/lib/dto/document.dto'
import { toActivityDTO } from '@/lib/dto/activity.dto'
import { percentChange, type DashboardSummaryDTO, type RevenuePointDTO } from '@/lib/dto/dashboard.dto'
import { TenantRequiredError } from '@/server/errors/app-error'
import type { RequestContext } from '@/server/http/context'

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/**
 * Dashboard service (Mission 5 §6). Replaces every mock data source with live Prisma
 * aggregations: KPIs (with month-over-month change), the revenue+invoice series, invoice
 * status breakdown, recent documents, and the recent activity feed — composed from a
 * handful of parallel, tenant-scoped queries (no N+1, no mocks).
 */
export class DashboardService extends BaseService {
  private readonly wsId: string
  private readonly dash: DashboardRepository
  private readonly activityRepo: ActivityRepository

  constructor(ctx: RequestContext) {
    super(ctx)
    if (!ctx.workspaceId) throw new TenantRequiredError()
    this.wsId = ctx.workspaceId
    this.dash = new DashboardRepository(ctx.workspaceId)
    this.activityRepo = new ActivityRepository()
  }

  async summary(months = 6): Promise<DashboardSummaryDTO> {
    const [counts, revenue, statusBreakdown, window, recentDocs, recentActs] = await Promise.all([
      this.dash.counts(),
      this.dash.revenue(),
      this.dash.statusBreakdown(),
      this.dash.monthlyWindow(months),
      this.dash.recentDocuments(5),
      this.activityRepo.recent(this.wsId, 8),
    ])

    const series = this.bucketMonthly(window, months)
    const collected = decimalToNumber(revenue.collected ?? 0)
    const invoiced = decimalToNumber(revenue.invoiced ?? 0)
    const outstanding = roundTo(Math.max(0, invoiced - collected))

    const cur = series[series.length - 1] ?? { revenue: 0, invoices: 0 }
    const prev = series[series.length - 2] ?? { revenue: 0, invoices: 0 }

    return {
      kpis: [
        {
          id: 'revenue',
          label: 'Total Revenue',
          value: roundTo(collected),
          change: percentChange(cur.revenue, prev.revenue),
          trend: cur.revenue >= prev.revenue ? 'up' : 'down',
          color: 'brand',
        },
        {
          id: 'invoices',
          label: 'Invoices This Month',
          value: counts.invoicesThisMonth,
          change: percentChange(cur.invoices, prev.invoices),
          trend: cur.invoices >= prev.invoices ? 'up' : 'down',
          color: 'success',
        },
        {
          id: 'clients',
          label: 'Active Clients',
          value: counts.clients,
          change: 0,
          trend: 'up',
          color: 'warning',
        },
        {
          id: 'products',
          label: 'Products',
          value: counts.products,
          change: 0,
          trend: 'up',
          color: 'brand',
        },
      ],
      revenue: series,
      statusBreakdown: statusBreakdown.map((s) => ({
        status: s.status,
        count: s.count,
        total: decimalToNumber(s.total ?? 0),
      })),
      recentDocuments: recentDocs.map(toDocumentDTO),
      recentActivity: recentActs.map(toActivityDTO),
      totals: {
        revenue: roundTo(collected),
        outstanding,
        clients: counts.clients,
        products: counts.products,
        invoices: counts.invoices,
      },
    }
  }

  /** Bucket the bounded invoice window into `months` monthly revenue/invoice points. */
  private bucketMonthly(
    window: MonthlyPoint[],
    months: number,
    now: Date = new Date(),
  ): RevenuePointDTO[] {
    const buckets: RevenuePointDTO[] = []
    const keys: string[] = []
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1))
      buckets.push({ month: MONTH_LABELS[d.getUTCMonth()], revenue: 0, invoices: 0 })
      keys.push(`${d.getUTCFullYear()}-${d.getUTCMonth()}`)
    }
    for (const point of window) {
      const key = `${point.issueDate.getUTCFullYear()}-${point.issueDate.getUTCMonth()}`
      const idx = keys.indexOf(key)
      if (idx >= 0) {
        buckets[idx].revenue += decimalToNumber(point.total)
        buckets[idx].invoices += 1
      }
    }
    return buckets.map((b) => ({ ...b, revenue: roundTo(b.revenue) }))
  }
}
