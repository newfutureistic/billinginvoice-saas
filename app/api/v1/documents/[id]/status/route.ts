import { z } from 'zod'
import { defineRoute } from '@/server/http/handler'
import { DocumentService } from '@/server/services/document.service'
import {
  documentStatusUpdateSchema,
  type DocumentStatusUpdateInput,
} from '@/lib/validation/document.schema'
import { idSchema } from '@/lib/validation/common.schema'
import type { DocumentDetailDTO } from '@/lib/dto/document.dto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const paramsSchema = z.object({ id: idSchema })
type Params = z.infer<typeof paramsSchema>

/**
 * PATCH /api/v1/documents/:id/status — transition a document's status (send → SENT,
 * accept → ACCEPTED, mark paid → PAID, …). Requires membership; the service applies the
 * `document:send` / `document:update` ownership check and sets `amountPaid` on PAID.
 */
export const PATCH = defineRoute<DocumentDetailDTO, DocumentStatusUpdateInput, undefined, Params>({
  requireMembership: true,
  schema: { params: paramsSchema, body: documentStatusUpdateSchema },
  csrf: true,
  handler: ({ params, body, ctx }) => new DocumentService(ctx).setStatus(params.id, body.status),
})
