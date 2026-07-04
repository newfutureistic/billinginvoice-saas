import { defineRoute } from '@/server/http/handler'
import { ClientService } from '@/server/services/client.service'
import { clientListQuerySchema, type ClientListQuery } from '@/lib/validation/client.schema'
import type { ClientOutputDTO } from '@/lib/dto/client.dto'
import type { ListResult } from '@/server/http/response'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** GET /api/v1/clients/deleted — the recycle bin of soft-deleted clients (`client:delete`). */
export const GET = defineRoute<ListResult<ClientOutputDTO>, undefined, ClientListQuery>({
  permission: 'client:delete',
  schema: { query: clientListQuerySchema },
  handler: ({ query, ctx }) =>
    new ClientService(ctx).listDeleted(
      { status: query.status, search: query.search },
      { page: query.page, pageSize: query.pageSize },
    ),
})
