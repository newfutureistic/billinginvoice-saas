import { defineRoute } from '@/server/http/handler'
import { AdminInvoiceRepository } from '@/server/repositories/admin-invoice.repository'
import { assertSiteAdmin } from '@/server/auth/site-admin'
import { buildPageMeta, resolvePagination } from '@/server/db/utils'
import { paginationQuerySchema, type PaginationQuery } from '@/lib/validation/common.schema'
import {
  toAdminInvoiceFromDocument,
  toAdminInvoiceFromDownloadLog,
  type AdminInvoiceDTO,
} from '@/lib/dto/admin-invoice.dto'
import type { ListResult } from '@/server/http/response'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// The list is two different tables (saved workspace Documents + builder-page
// InvoiceDownloadLogs) merged and re-sorted in memory, so pagination reads from a capped
// recent-activity pool rather than a literal combined SQL total — the right tradeoff for
// an admin activity feed, not a reporting system.
const MERGE_POOL_SIZE = 300

/**
 * GET /api/v1/admin/invoices — every invoice PDF on the platform: saved, dashboard-created
 * documents (with the workspace + user that created them) and PDFs downloaded from the
 * public no-signup builder (with the user if they were signed in, or anonymous if not).
 * Site-admin only (see `server/auth/site-admin.ts`).
 */
export const GET = defineRoute<ListResult<AdminInvoiceDTO>, undefined, PaginationQuery>({
  requireAuth: true,
  schema: { query: paginationQuerySchema },
  handler: async ({ query, ctx }) => {
    assertSiteAdmin(ctx, 'The invoices list')
    const repo = new AdminInvoiceRepository()
    const [documents, downloadLogs] = await Promise.all([
      repo.listDocuments(MERGE_POOL_SIZE),
      repo.listDownloadLogs(MERGE_POOL_SIZE),
    ])
    const merged: AdminInvoiceDTO[] = [
      ...documents.map(toAdminInvoiceFromDocument),
      ...downloadLogs.map(toAdminInvoiceFromDownloadLog),
    ].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))

    const { page, pageSize, skip, take } = resolvePagination({ page: query.page, pageSize: query.pageSize })
    const items = merged.slice(skip, skip + take)
    return { items, pagination: buildPageMeta(merged.length, page, pageSize) }
  },
})
