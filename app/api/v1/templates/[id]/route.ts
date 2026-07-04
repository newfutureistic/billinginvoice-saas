import { z } from 'zod'
import { defineRoute } from '@/server/http/handler'
import { TemplateService } from '@/server/services/template.service'
import { templateUpdateSchema, type TemplateUpdateInput } from '@/lib/validation/template.schema'
import { idSchema } from '@/lib/validation/common.schema'
import type { TemplateOutputDTO } from '@/lib/dto/template.dto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const paramsSchema = z.object({ id: idSchema })
type Params = z.infer<typeof paramsSchema>

export const GET = defineRoute<TemplateOutputDTO, undefined, undefined, Params>({
  requireMembership: true,
  schema: { params: paramsSchema },
  handler: ({ params, ctx }) => new TemplateService(ctx).get(params.id),
})

export const PATCH = defineRoute<TemplateOutputDTO, TemplateUpdateInput, undefined, Params>({
  permission: 'template:update',
  schema: { params: paramsSchema, body: templateUpdateSchema },
  csrf: true,
  handler: ({ params, body, ctx }) => new TemplateService(ctx).update(params.id, body),
})

export const DELETE = defineRoute<{ ok: true }, undefined, undefined, Params>({
  permission: 'template:update',
  schema: { params: paramsSchema },
  csrf: true,
  handler: async ({ params, ctx }) => {
    await new TemplateService(ctx).remove(params.id)
    return { ok: true }
  },
})
