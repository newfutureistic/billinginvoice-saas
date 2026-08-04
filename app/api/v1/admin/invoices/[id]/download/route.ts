import { z } from 'zod'
import { defineRoute } from '@/server/http/handler'
import { AdminInvoiceRepository } from '@/server/repositories/admin-invoice.repository'
import { assertSiteAdmin } from '@/server/auth/site-admin'
import { storageService } from '@/server/services/storage.service'
import { BusinessError, NotFoundError } from '@/server/errors/app-error'
import { idSchema } from '@/lib/validation/common.schema'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const paramsSchema = z.object({ id: idSchema })
const querySchema = z.object({ source: z.enum(['dashboard', 'builder']) })
type Params = z.infer<typeof paramsSchema>
type Query = z.infer<typeof querySchema>

/**
 * GET /api/v1/admin/invoices/:id/download?source=dashboard|builder — a signed URL for one
 * invoice's PDF (site-admin only). `builder` downloads always have a stored file (the
 * bytes are uploaded when the download is logged); `dashboard` documents generate their
 * PDF lazily on first view/download in the normal product flow, so one that's never been
 * opened yet won't have a file to sign — the admin is told to ask the owner to view/
 * download it once, rather than this route replicating full cross-tenant PDF generation.
 */
export const GET = defineRoute<{ url: string }, undefined, Query, Params>({
  requireAuth: true,
  schema: { params: paramsSchema, query: querySchema },
  handler: async ({ params, query, ctx }) => {
    assertSiteAdmin(ctx, 'The invoices list')
    const repo = new AdminInvoiceRepository()

    if (query.source === 'dashboard') {
      const doc = await repo.findDocumentById(params.id)
      if (!doc) throw new NotFoundError('Invoice')
      if (!doc.pdfFile) {
        throw new BusinessError('This invoice has no generated PDF yet — ask the workspace owner to view or download it once first.')
      }
      const url = await storageService.createSignedUrl(doc.pdfFile.bucket, doc.pdfFile.path)
      return { url }
    }

    const log = await repo.findDownloadLogById(params.id)
    if (!log) throw new NotFoundError('Invoice')
    const url = await storageService.createSignedUrl(log.bucket, log.path)
    return { url }
  },
})
