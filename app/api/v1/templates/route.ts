import { defineRoute } from '@/server/http/handler'
import { TemplateService } from '@/server/services/template.service'
import { templateCreateSchema, type TemplateCreateInput } from '@/lib/validation/template.schema'
import { paginationQuerySchema, type PaginationQuery } from '@/lib/validation/common.schema'
import type { TemplateOutputDTO } from '@/lib/dto/template.dto'
import type { ListResult } from '@/server/http/response'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/v1/templates — workspace + system templates (any member). POST creates a
 * workspace template (`template:create`).
 */
export const GET = defineRoute<ListResult<TemplateOutputDTO>, undefined, PaginationQuery>({
  requireMembership: true,
  schema: { query: paginationQuerySchema },
  handler: ({ query, ctx }) =>
    new TemplateService(ctx).list({ page: query.page, pageSize: query.pageSize }),
})

export const POST = defineRoute<TemplateOutputDTO, TemplateCreateInput>({
  permission: 'template:create',
  schema: { body: templateCreateSchema },
  csrf: true,
  status: 201,
  handler: ({ body, ctx }) => new TemplateService(ctx).create(body),
})
