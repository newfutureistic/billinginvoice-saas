import { z } from 'zod'
import { defineRoute } from '@/server/http/handler'
import { TemplateService } from '@/server/services/template.service'
import { duplicateTemplateSchema, type DuplicateTemplateInput } from '@/lib/validation/template.schema'
import { idSchema } from '@/lib/validation/common.schema'
import type { TemplateOutputDTO } from '@/lib/dto/template.dto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const paramsSchema = z.object({ id: idSchema })
type Params = z.infer<typeof paramsSchema>

/** POST /api/v1/templates/:id/duplicate — copy a template into a new editable one. */
export const POST = defineRoute<TemplateOutputDTO, DuplicateTemplateInput, undefined, Params>({
  permission: 'template:create',
  schema: { params: paramsSchema, body: duplicateTemplateSchema },
  csrf: true,
  status: 201,
  handler: ({ params, body, ctx }) => new TemplateService(ctx).duplicate(params.id, body),
})
