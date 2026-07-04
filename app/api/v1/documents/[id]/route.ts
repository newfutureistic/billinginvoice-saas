import { z } from 'zod'
import { defineRoute } from '@/server/http/handler'
import { DocumentService } from '@/server/services/document.service'
import { documentUpdateSchema, type DocumentUpdateInput } from '@/lib/validation/document.schema'
import { idSchema } from '@/lib/validation/common.schema'
import type { DocumentDetailDTO } from '@/lib/dto/document.dto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const paramsSchema = z.object({ id: idSchema })
const deleteQuerySchema = z.object({ permanent: z.coerce.boolean().optional() })
type Params = z.infer<typeof paramsSchema>
type DeleteQuery = z.infer<typeof deleteQuerySchema>

/**
 * Document detail / update / delete. These require membership; ownership (`:own` for
 * MEMBERs) is enforced inside the service so a MEMBER can only touch documents they
 * created (others 404, never leaking existence).
 */
export const GET = defineRoute<DocumentDetailDTO, undefined, undefined, Params>({
  permission: 'document:read',
  schema: { params: paramsSchema },
  handler: ({ params, ctx }) => new DocumentService(ctx).get(params.id),
})

export const PATCH = defineRoute<DocumentDetailDTO, DocumentUpdateInput, undefined, Params>({
  requireMembership: true,
  schema: { params: paramsSchema, body: documentUpdateSchema },
  csrf: true,
  handler: ({ params, body, ctx }) => new DocumentService(ctx).update(params.id, body),
})

export const DELETE = defineRoute<{ ok: true }, undefined, DeleteQuery, Params>({
  requireMembership: true,
  schema: { params: paramsSchema, query: deleteQuerySchema },
  csrf: true,
  handler: async ({ params, query, ctx }) => {
    const service = new DocumentService(ctx)
    if (query.permanent) await service.hardDelete(params.id)
    else await service.remove(params.id)
    return { ok: true }
  },
})
