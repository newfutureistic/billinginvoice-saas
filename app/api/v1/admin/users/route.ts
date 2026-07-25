import { defineRoute } from '@/server/http/handler'
import { UserRepository } from '@/server/repositories/user.repository'
import { assertSiteAdmin } from '@/server/auth/site-admin'
import { mapListResult } from '@/server/http/response'
import { paginationQuerySchema, type PaginationQuery } from '@/lib/validation/common.schema'
import { toAdminUserDTO, type AdminUserDTO } from '@/lib/dto/user.dto'
import type { ListResult } from '@/server/http/response'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/v1/admin/users — every platform user (across all workspaces) with the number
 * of invoices they've created, for the site-admin "all users" view. Not workspace-scoped
 * (a site admin may not even have an active workspace selected), so this only requires a
 * session — the real gate is {@link assertSiteAdmin}, same allowlist as the blog CMS.
 */
export const GET = defineRoute<ListResult<AdminUserDTO>, undefined, PaginationQuery>({
  requireAuth: true,
  schema: { query: paginationQuerySchema },
  handler: async ({ query, ctx }) => {
    assertSiteAdmin(ctx, 'The users list')
    const page = await new UserRepository().listAllWithInvoiceCounts({
      page: query.page,
      pageSize: query.pageSize,
    })
    return mapListResult(page, ({ user, invoiceCount }) => toAdminUserDTO(user, invoiceCount))
  },
})
