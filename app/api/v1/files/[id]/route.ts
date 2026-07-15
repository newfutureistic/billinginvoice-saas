import { z } from 'zod'
import { defineRoute } from '@/server/http/handler'
import { FileService, type DownloadUrl } from '@/server/services/file.service'
import { idSchema } from '@/lib/validation/common.schema'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const paramsSchema = z.object({ id: idSchema })
type Params = z.infer<typeof paramsSchema>

/**
 * GET /api/v1/files/:id — mint a short-lived signed download URL after a tenant check
 * (authorization happens here, before any URL is issued). DELETE removes the object + row.
 */
export const GET = defineRoute<DownloadUrl, undefined, undefined, Params>({
  requireMembership: true,
  schema: { params: paramsSchema },
  handler: ({ params, ctx }) => new FileService(ctx).getDownloadUrl(params.id),
})

export const DELETE = defineRoute<{ ok: true }, undefined, undefined, Params>({
  requireMembership: true,
  schema: { params: paramsSchema },
  csrf: true,
  handler: async ({ params, ctx }) => {
    await new FileService(ctx).delete(params.id)
    return { ok: true }
  },
})
