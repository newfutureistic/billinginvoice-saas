import { defineRoute } from '@/server/http/handler'
import { prisma } from '@/server/db/prisma'
import { verifyWebhookSignature } from '@/server/adapters/razorpay'
import { PaymentService } from '@/server/services/payment.service'
import { createSystemContext } from '@/server/http/context'
import { BadRequestError, UnauthenticatedError } from '@/server/errors/app-error'
import { roundTo } from '@/server/utils/decimal'
import type { RecordPaymentBody } from '@/lib/validation/payment.schema'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export interface RazorpayWebhookResult {
  received: boolean
  handled: string
}

interface RazorpayEntity {
  id?: string
  amount?: number
  notes?: Record<string, string>
}

/**
 * POST /api/v1/webhooks/razorpay — server-to-server capture notification (no session).
 * Trust is established by the webhook HMAC signature (`x-razorpay-signature`), not by auth.
 * The raw body is read verbatim for signature verification, then a `payment.captured` /
 * `order.paid` event is recorded via the existing PaymentService using a system context bound
 * to the document's workspace. Recording is idempotent (`rzp_<paymentId>`), so a re-delivered
 * webhook — or one racing the Checkout callback — never double-charges. We always ACK (200)
 * once the signature is valid so Razorpay stops retrying.
 */
export const POST = defineRoute<RazorpayWebhookResult>({
  handler: async ({ req }) => {
    const raw = await req.text()
    const signature = req.headers.get('x-razorpay-signature') ?? ''
    if (!verifyWebhookSignature(raw, signature)) {
      throw new UnauthenticatedError('Invalid Razorpay webhook signature')
    }

    let event: unknown
    try {
      event = JSON.parse(raw)
    } catch {
      throw new BadRequestError('Invalid webhook payload')
    }

    const e = event as {
      event?: string
      payload?: { payment?: { entity?: RazorpayEntity }; order?: { entity?: RazorpayEntity } }
    }
    if (e.event !== 'payment.captured' && e.event !== 'order.paid') {
      return { received: true, handled: 'ignored' }
    }

    const payment = e.payload?.payment?.entity ?? {}
    const order = e.payload?.order?.entity ?? {}
    const paymentId = payment.id
    const amountMinor = payment.amount
    const notes = payment.notes ?? order.notes ?? {}
    const documentId = notes.documentId

    if (!paymentId || !documentId || !amountMinor) {
      return { received: true, handled: 'missing-fields' }
    }

    const doc = await prisma.document.findUnique({
      where: { id: documentId },
      select: { workspaceId: true },
    })
    if (!doc) return { received: true, handled: 'unknown-document' }

    const ctx = createSystemContext('razorpay.webhook')
    ctx.workspaceId = doc.workspaceId
    const input: RecordPaymentBody = { amount: roundTo(amountMinor / 100), method: 'ONLINE' }

    try {
      await new PaymentService(ctx).record(documentId, input, {
        provider: 'RAZORPAY',
        providerRef: paymentId,
        idempotencyKey: `rzp_${paymentId}`,
      })
      return { received: true, handled: 'recorded' }
    } catch {
      // Already settled / amount reconciliation mismatch. Idempotency guarantees no double
      // charge; ACK so Razorpay stops retrying (the discrepancy is captured in server logs).
      return { received: true, handled: 'skipped' }
    }
  },
})
