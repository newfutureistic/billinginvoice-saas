import { Prisma, type Document, type DocumentStatus } from '@prisma/client'
import { prisma, type DbClient } from '@/server/db/prisma'
import { BaseRepository } from '@/server/repositories/base.repository'

export interface EntityCounts {
  clients: number
  products: number
  documents: number
  invoices: number
  invoicesThisMonth: number
}

export interface RevenueTotals {
  /** Sum of amountPaid across all documents. */
  collected: Prisma.Decimal | null
  /** Sum of (total) for invoices. */
  invoiced: Prisma.Decimal | null
}

export interface StatusBucket {
  status: DocumentStatus
  count: number
  total: Prisma.Decimal | null
}

export interface MonthlyPoint {
  issueDate: Date
  total: Prisma.Decimal
  amountPaid: Prisma.Decimal
}

/**
 * Read-only dashboard aggregations. Every method is a single tenant-scoped query (counts,
 * sums, group-bys, or a bounded window fetch) so the dashboard composes from a handful of
 * parallel queries with no N+1. All data comes from Prisma — no mock sources.
 */
export class DashboardRepository extends BaseRepository {
  constructor(
    private readonly workspaceId: string,
    db: DbClient = prisma,
  ) {
    super(db)
  }

  private get active(): { workspaceId: string; deletedAt: null } {
    return { workspaceId: this.workspaceId, deletedAt: null }
  }

  async counts(now: Date = new Date()): Promise<EntityCounts> {
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
    const [clients, products, documents, invoices, invoicesThisMonth] = await Promise.all([
      this.db.client.count({ where: this.active }),
      this.db.product.count({ where: this.active }),
      this.db.document.count({ where: this.active }),
      this.db.document.count({ where: { ...this.active, type: 'INVOICE' } }),
      this.db.document.count({
        where: { ...this.active, type: 'INVOICE', issueDate: { gte: monthStart } },
      }),
    ])
    return { clients, products, documents, invoices, invoicesThisMonth }
  }

  async revenue(): Promise<RevenueTotals> {
    const [collected, invoiced] = await Promise.all([
      this.db.document.aggregate({ where: this.active, _sum: { amountPaid: true } }),
      this.db.document.aggregate({
        where: { ...this.active, type: 'INVOICE' },
        _sum: { total: true },
      }),
    ])
    return { collected: collected._sum.amountPaid, invoiced: invoiced._sum.total }
  }

  async statusBreakdown(): Promise<StatusBucket[]> {
    const groups = await this.db.document.groupBy({
      by: ['status'],
      where: { ...this.active, type: 'INVOICE' },
      _count: { _all: true },
      _sum: { total: true },
    })
    return groups.map((g) => ({ status: g.status, count: g._count._all, total: g._sum.total }))
  }

  /** Bounded window (default 6 months) of invoices for JS monthly bucketing. */
  monthlyWindow(months = 6, now: Date = new Date()): Promise<MonthlyPoint[]> {
    const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (months - 1), 1))
    return this.run(() =>
      this.db.document.findMany({
        where: { ...this.active, type: 'INVOICE', issueDate: { gte: from } },
        select: { issueDate: true, total: true, amountPaid: true },
        orderBy: { issueDate: 'asc' },
      }),
    )
  }

  recentDocuments(limit = 5): Promise<Document[]> {
    return this.run(() =>
      this.db.document.findMany({
        where: this.active,
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
    )
  }

  /** Top clients by lifetime invoiced total (grouped, single query). */
  async topClients(limit = 5): Promise<Array<{ clientId: string; total: Prisma.Decimal | null }>> {
    const groups = await this.db.document.groupBy({
      by: ['clientId'],
      where: { ...this.active, type: 'INVOICE', clientId: { not: null } },
      _sum: { total: true },
      orderBy: { _sum: { total: 'desc' } },
      take: limit,
    })
    return groups.map((g) => ({ clientId: g.clientId as string, total: g._sum.total }))
  }
}
