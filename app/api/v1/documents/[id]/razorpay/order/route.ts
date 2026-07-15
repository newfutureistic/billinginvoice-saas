import { z } from 'zod'
import { defineRoute } from '@/server/http/handler'
import { DocumentRepository } from '@/server/repositories/document.repository'
import { createRazorpayOrder, getRazorpayKeyId } from '@/server/adapters/razorpay'
import { isRazorpayEnabled } from '@/server/config/env'
import {
  BadRequestError,
  ServiceUnavailableError,
  TenantRequiredError,
} from '@/server/errors/app-error'
import { decimalToNumber, roundTo } from '@/server/utils/decimal'
import { idSchema } from '@/lib/validation/common.schema'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const paramsSchema = z.object({ id: idSchema })
type Params = z.infer<typeof paramsSchema>

export interface RazorpayOrderResult {
  orderId: string
  amount: number // minor units (paise)
  currency: string
  keyId: string
  documentId: string
  number: string
}

/**
 * POST /api/v1/documents/:id/razorpay/order — create a Razorpay order for the invoice's
 * remaining balance. The order carries `notes.documentId` so the webhook can attribute the
 * capture back to this document. Gated on configuration (503 when Razorpay isn't set up).
 */
export const POST = defineRoute<RazorpayOrderResult, undefined, undefined, Params>({
  requireMembership: true,
  schema: { params: paramsSchema },
  csrf: true,
  status: 201,
  handler: async ({ params, ctx }) => {
    if (!isRazorpayEnabled()) throw new ServiceUnavailableError('Razorpay is not configured')
    if (!ctx.workspaceId) throw new TenantRequiredError()

    const doc = await new DocumentRepository(ctx.workspaceId).requireById(params.id)
    const balance = roundTo(decimalToNumber(doc.total) - decimalToNumber(doc.amountPaid))
    if (balance <= 0.005) throw new BadRequestError('This invoice is already fully paid')

    const amountMinor = Math.round(balance * 100)
    const order = await createRazorpayOrder({
      amountMinor,
      currency: doc.currency,
      receipt: `rcpt_${doc.number}`,
      notes: { documentId: doc.id, number: doc.number, workspaceId: ctx.workspaceId },
    })

    return {
      orderId: order.id,
      amount: amountMinor,
      currency: doc.currency,
      keyId: getRazorpayKeyId() ?? '',
      documentId: doc.id,
      number: doc.number,
    }
  },
})
