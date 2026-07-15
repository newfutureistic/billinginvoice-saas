import { z } from 'zod'
import { defineRoute } from '@/server/http/handler'
import { PdfService, type PdfResult } from '@/server/services/pdf.service'
import { idSchema } from '@/lib/validation/common.schema'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const paramsSchema = z.object({ id: idSchema })
type Params = z.infer<typeof paramsSchema>

/**
 * Invoice/document PDF (RBAC `document:export`, held by every role).
 * GET returns the PDF URL (generating it on first request); POST forces regeneration.
 */
export const GET = defineRoute<PdfResult, undefined, undefined, Params>({
  permission: 'document:export',
  schema: { params: paramsSchema },
  handler: ({ params, ctx }) => new PdfService(ctx).getOrCreateUrl(params.id),
})

export const POST = defineRoute<PdfResult, undefined, undefined, Params>({
  permission: 'document:export',
  schema: { params: paramsSchema },
  csrf: true,
  handler: ({ params, ctx }) => new PdfService(ctx).generate(params.id),
})
