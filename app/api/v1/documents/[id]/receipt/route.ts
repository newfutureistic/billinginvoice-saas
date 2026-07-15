import { z } from 'zod'
import { defineRoute } from '@/server/http/handler'
import { PdfService } from '@/server/services/pdf.service'
import { EmailService } from '@/server/services/email.service'
import { decimalToNumber } from '@/server/utils/decimal'
import { idSchema } from '@/lib/validation/common.schema'
import { BadRequestError } from '@/server/errors/app-error'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const paramsSchema = z.object({ id: idSchema })
type Params = z.infer<typeof paramsSchema>

interface ReceiptResult {
  receiptNumber: string
  filename: string
  contentBase64: string
}

/** GET /api/v1/documents/:id/receipt — the payment receipt PDF (base64; download client-side). */
export const GET = defineRoute<ReceiptResult, undefined, undefined, Params>({
  permission: 'document:export',
  schema: { params: paramsSchema },
  handler: async ({ params, ctx }) => {
    const { bytes, receiptNumber } = await new PdfService(ctx).renderReceiptBytes(params.id)
    return { receiptNumber, filename: `${receiptNumber}.pdf`, contentBase64: Buffer.from(bytes).toString('base64') }
  },
})

const bodySchema = z.object({ to: z.string().email().optional() }).optional()

/** POST /api/v1/documents/:id/receipt — email the receipt (payment summary) to the recipient. */
export const POST = defineRoute<{ sent: boolean; to: string }, z.infer<typeof bodySchema>, undefined, Params>({
  permission: 'document:export',
  schema: { params: paramsSchema, body: bodySchema },
  csrf: true,
  handler: async ({ params, body, ctx }) => {
    const { receiptNumber, doc } = await new PdfService(ctx).renderReceiptBytes(params.id)
    const recipient = readEmail(doc.recipient) ?? body?.to
    if (!recipient) throw new BadRequestError('No recipient email on the document; provide `to`')
    const total = decimalToNumber(doc.total)
    const paidNum = decimalToNumber(doc.amountPaid)
    const paid = `${doc.currency} ${paidNum.toFixed(2)}`
    const balance = `${doc.currency} ${Math.max(0, total - paidNum).toFixed(2)}`
    const result = await new EmailService().sendReceipt(
      recipient,
      { number: doc.number, receiptNumber, paid, balance },
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
