import { z } from 'zod'
import { defineRoute } from '@/server/http/handler'
import { TemplateService } from '@/server/services/template.service'
import { idSchema } from '@/lib/validation/common.schema'
import type { TemplateOutputDTO } from '@/lib/dto/template.dto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const paramsSchema = z.object({ id: idSchema })
type Params = z.infer<typeof paramsSchema>

/** POST /api/v1/templates/:id/default — set the workspace default template. */
export const POST = defineRoute<TemplateOutputDTO, undefined, undefined, Params>({
  permission: 'template:update',
  schema: { params: paramsSchema },
  csrf: true,
  handler: ({ params, ctx }) => new TemplateService(ctx).setDefault(params.id),
})
