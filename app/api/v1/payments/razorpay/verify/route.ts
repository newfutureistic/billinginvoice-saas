import { z } from 'zod'
import { defineRoute } from '@/server/http/handler'
import { PaymentService, type RecordPaymentResult } from '@/server/services/payment.service'
import { verifyPaymentSignature } from '@/server/adapters/razorpay'
import { isRazorpayEnabled } from '@/server/config/env'
import { DocumentRepository } from '@/server/repositories/document.repository'
import {
  AuthorizationError,
  ServiceUnavailableError,
  TenantRequiredError,
} from '@/server/errors/app-error'
import { decimalToNumber, roundTo } from '@/server/utils/decimal'
import { idSchema } from '@/lib/validation/common.schema'
import type { RecordPaymentBody } from '@/lib/validation/payment.schema'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const bodySchema = z.object({
  documentId: idSchema,
  orderId: z.string().min(1),
  paymentId: z.string().min(1),
  signature: z.string().min(1),
})
type Body = z.infer<typeof bodySchema>

/**
 * POST /api/v1/payments/razorpay/verify — the Checkout success callback.
 * Verifies `HMAC(order_id|payment_id, key_secret)`; on success records the capture through the
 * existing PaymentService (idempotency key `rzp_<paymentId>` makes it safe against a racing
 * webhook). Signature failure is a hard 403 — no payment is recorded.
 */
export const POST = defineRoute<RecordPaymentResult, Body>({
  requireMembership: true,
  schema: { body: bodySchema },
  csrf: true,
  status: 201,
  handler: async ({ body, ctx }) => {
    if (!isRazorpayEnabled()) throw new ServiceUnavailableError('Razorpay is not configured')
    if (!verifyPaymentSignature(body.orderId, body.paymentId, body.signature)) {
      throw new AuthorizationError('Invalid Razorpay payment signature')
    }
    if (!ctx.workspaceId) throw new TenantRequiredError()

    const doc = await new DocumentRepository(ctx.workspaceId).requireById(body.documentId)
    const balance = roundTo(decimalToNumber(doc.total) - decimalToNumber(doc.amountPaid))
    const input: RecordPaymentBody = { amount: balance, method: 'ONLINE', reference: body.paymentId }

    return new PaymentService(ctx).record(body.documentId, input, {
      provider: 'RAZORPAY',
      providerRef: body.paymentId,
      idempotencyKey: `rzp_${body.paymentId}`,
    })
  },
})
