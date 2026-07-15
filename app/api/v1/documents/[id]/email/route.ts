import { z } from 'zod'
import { defineRoute } from '@/server/http/handler'
import { DocumentRepository } from '@/server/repositories/document.repository'
import { PdfService } from '@/server/services/pdf.service'
import { EmailService } from '@/server/services/email.service'
import { decimalToNumber } from '@/server/utils/decimal'
import { idSchema } from '@/lib/validation/common.schema'
import { sendDocumentEmailSchema, type SendDocumentEmailInput } from '@/lib/validation/file.schema'
import { BadRequestError } from '@/server/errors/app-error'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const paramsSchema = z.object({ id: idSchema })
type Params = z.infer<typeof paramsSchema>

/**
 * POST /api/v1/documents/:id/email — email the document to its recipient with a link to
 * the generated PDF (RBAC `document:export`). Composes the existing document, PDF and
 * email services — no new business logic. The recipient defaults to the document's
 * recipient email and can be overridden.
 */
export const POST = defineRoute<{ sent: boolean; to: string }, SendDocumentEmailInput, undefined, Params>({
  permission: 'document:export',
  schema: { params: paramsSchema, body: sendDocumentEmailSchema },
  csrf: true,
  handler: async ({ params, body, ctx }) => {
    const doc = await new DocumentRepository(ctx.workspaceId as string).requireById(params.id)
    const recipient = readEmail(doc.recipient) ?? body.to
    if (!recipient) throw new BadRequestError('No recipient email on the document; provide `to`')

    // Best-effort PDF link (present only when storage is configured).
    const pdf = await new PdfService(ctx).getOrCreateUrl(params.id).catch(() => null)

    const total = `${doc.currency} ${decimalToNumber(doc.total).toFixed(2)}`
    const result = await new EmailService().sendInvoice(
      recipient,
      { documentType: doc.type, number: doc.number, total, url: pdf?.download.url },
      ctx.workspaceId as string,
      doc.id,
    )
    return { sent: result.sent, to: recipient }
  },
})

function readEmail(json: unknown): string | undefined {
  if (json && typeof json === 'object' && !Array.isArray(json)) {
    const email = (json as Record<string, unknown>).email
    if (typeof email === 'string' && email.includes('@')) return email
  }
  return undefined
}
