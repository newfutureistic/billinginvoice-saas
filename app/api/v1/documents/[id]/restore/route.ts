import { z } from 'zod'
import { defineRoute } from '@/server/http/handler'
import { DocumentService } from '@/server/services/document.service'
import { idSchema } from '@/lib/validation/common.schema'
import type { DocumentDetailDTO } from '@/lib/dto/document.dto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const paramsSchema = z.object({ id: idSchema })
type Params = z.infer<typeof paramsSchema>

/** POST /api/v1/documents/:id/restore — recover a soft-deleted document. */
export const POST = defineRoute<DocumentDetailDTO, undefined, undefined, Params>({
  requireMembership: true,
  schema: { params: paramsSchema },
  csrf: true,
  handler: ({ params, ctx }) => new DocumentService(ctx).restore(params.id),
})
