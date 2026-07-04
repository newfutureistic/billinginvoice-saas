import { z } from 'zod'
import { defineRoute } from '@/server/http/handler'
import { ClientService } from '@/server/services/client.service'
import { idSchema } from '@/lib/validation/common.schema'
import type { ClientOutputDTO } from '@/lib/dto/client.dto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const paramsSchema = z.object({ id: idSchema })
type Params = z.infer<typeof paramsSchema>

/** POST /api/v1/clients/:id/restore — recover a soft-deleted client (`client:delete`). */
export const POST = defineRoute<ClientOutputDTO, undefined, undefined, Params>({
  permission: 'client:delete',
  schema: { params: paramsSchema },
  csrf: true,
  handler: ({ params, ctx }) => new ClientService(ctx).restore(params.id),
})
