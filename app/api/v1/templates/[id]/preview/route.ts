import { z } from 'zod'
import { defineRoute } from '@/server/http/handler'
import { TemplateService } from '@/server/services/template.service'
import { idSchema } from '@/lib/validation/common.schema'
import type { TemplatePreviewDTO } from '@/lib/dto/template.dto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const paramsSchema = z.object({ id: idSchema })
type Params = z.infer<typeof paramsSchema>

/** GET /api/v1/templates/:id/preview — lightweight preview metadata for the gallery. */
export const GET = defineRoute<TemplatePreviewDTO, undefined, undefined, Params>({
  requireMembership: true,
  schema: { params: paramsSchema },
  handler: ({ params, ctx }) => new TemplateService(ctx).preview(params.id),
})
