import { defineRoute } from '@/server/http/handler'
import { QrService, qrDataUrl, qrSvg } from '@/server/services/qr.service'
import { qrGenerateSchema, type QrGenerateInput } from '@/lib/validation/file.schema'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface QrResult {
  format: 'png' | 'svg'
  /** Inline data URL (png) or markup (svg) when not stored. */
  dataUrl?: string
  svg?: string
  /** Present when `store: true` — the persisted QR FileObject + a signed URL. */
  fileId?: string
  url?: string
}

/**
 * POST /api/v1/qr — generate a QR code (Mission 7). Returns an inline data URL / SVG by
 * default, or persists it as a `QR` FileObject when `store: true`. Any workspace member.
 */
export const POST = defineRoute<QrResult, QrGenerateInput>({
  requireMembership: true,
  schema: { body: qrGenerateSchema },
  csrf: true,
  rateLimit: { limit: 120, windowMs: 60_000 },
  handler: async ({ body, ctx }) => {
    const opts = { size: body.size, margin: body.margin }
    if (body.store) {
      const stored = await new QrService(ctx).generateAndStore(body.data, { ...opts, format: body.format })
      return { format: body.format, fileId: stored.fileId, url: stored.download.url }
    }
    if (body.format === 'svg') {
      return { format: 'svg', svg: await qrSvg(body.data, opts) }
    }
    return { format: 'png', dataUrl: await qrDataUrl(body.data, opts) }
  },
})
