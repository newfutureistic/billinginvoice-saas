import { defineRoute } from '@/server/http/handler'
import { ClientService } from '@/server/services/client.service'
import { clientCreateSchema, clientListQuerySchema } from '@/lib/validation/client.schema'
import type { ClientCreateInput, ClientListQuery } from '@/lib/validation/client.schema'
import type { ClientOutputDTO } from '@/lib/dto/client.dto'
import type { ListResult } from '@/server/http/response'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/v1/clients — paginated, filterable, sortable, tenant-scoped client list
 * (RBAC `client:read`). POST creates a client (`client:create`). Workspace comes from the
 * `x-workspace-id` header; membership + role are enforced by the pipeline.
 */
export const GET = defineRoute<ListResult<ClientOutputDTO>, undefined, ClientListQuery>({
  permission: 'client:read',
  schema: { query: clientListQuerySchema },
  handler: async ({ query, ctx }) => {
    const { page, pageSize, sort, status, search } = query
    return new ClientService(ctx).list(
      { status, search },
      { pagination: { page, pageSize }, sort },
    )
  },
})

export const POST = defineRoute<ClientOutputDTO, ClientCreateInput>({
  permission: 'client:create',
  schema: { body: clientCreateSchema },
  csrf: true,
  status: 201,
  handler: ({ body, ctx }) => new ClientService(ctx).create(body),
})
