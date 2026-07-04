import { z } from 'zod'
import { defineRoute } from '@/server/http/handler'
import { ClientService } from '@/server/services/client.service'
import { clientUpdateSchema, type ClientUpdateInput } from '@/lib/validation/client.schema'
import { idSchema } from '@/lib/validation/common.schema'
import type { ClientOutputDTO } from '@/lib/dto/client.dto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const paramsSchema = z.object({ id: idSchema })
const deleteQuerySchema = z.object({ permanent: z.coerce.boolean().optional() })
type Params = z.infer<typeof paramsSchema>
type DeleteQuery = z.infer<typeof deleteQuerySchema>

/** GET /api/v1/clients/:id — detail (`client:read`). */
export const GET = defineRoute<ClientOutputDTO, undefined, undefined, Params>({
  permission: 'client:read',
  schema: { params: paramsSchema },
  handler: ({ params, ctx }) => new ClientService(ctx).get(params.id),
})

/** PATCH /api/v1/clients/:id — update (`client:update`). */
export const PATCH = defineRoute<ClientOutputDTO, ClientUpdateInput, undefined, Params>({
  permission: 'client:update',
  schema: { params: paramsSchema, body: clientUpdateSchema },
  csrf: true,
  handler: ({ params, body, ctx }) => new ClientService(ctx).update(params.id, body),
})

/** DELETE /api/v1/clients/:id — soft delete, or permanent with `?permanent=true` (`client:delete`). */
export const DELETE = defineRoute<{ ok: true }, undefined, DeleteQuery, Params>({
  permission: 'client:delete',
  schema: { params: paramsSchema, query: deleteQuerySchema },
  csrf: true,
  handler: async ({ params, query, ctx }) => {
    const service = new ClientService(ctx)
    if (query.permanent) await service.hardDelete(params.id)
    else await service.remove(params.id)
    return { ok: true }
  },
})
