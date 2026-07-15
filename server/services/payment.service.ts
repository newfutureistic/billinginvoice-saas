import { BaseService } from '@/server/services/base.service'
import { ActivityService } from '@/server/services/activity.service'
import { EmailService } from '@/server/services/email.service'
import { PaymentRepository } from '@/server/repositories/payment.repository'
import { DocumentRepository } from '@/server/repositories/document.repository'
import { runInTransaction } from '@/server/db/transaction'
import { decimalToNumber, roundTo } from '@/server/utils/decimal'
import { BadRequestError, NotFoundError, TenantRequiredError } from '@/server/errors/app-error'
import { toPaymentDTO, type PaymentOutputDTO } from '@/lib/dto/payment.dto'
import { toDocumentDetailDTO, type DocumentDetailDTO } from '@/lib/dto/document.dto'
import type { RecordPaymentBody } from '@/lib/validation/payment.schema'
import type { RequestContext } from '@/server/http/context'

export interface RecordPaymentResult {
  payment: PaymentOutputDTO
  document: DocumentDetailDTO
}

function readRecipientEmail(json: unknown): string | undefined {
  if (json && typeof json === 'object' && !Array.isArray(json)) {
    const email = (json as Record<string, unknown>).email
    if (typeof email === 'string' && email.includes('@')) return email
  }
  return undefined
}

/**
 * Payment engine. Records manual payments against a document and keeps the document's
 * `amountPaid` + `status` in sync with the **authoritative sum of its allocations** — the
 * status is derived from real payment records, never set by hand. Reuses the existing
 * Document/Payment repositories; no Razorpay, no subscriptions.
 */
export class PaymentService extends BaseService {
  private readonly wsId: string
  private readonly docs: DocumentRepository
  private readonly payments: PaymentRepository
  private readonly activity: ActivityService

  constructor(ctx: RequestContext) {
    super(ctx)
    if (!ctx.workspaceId) throw new TenantRequiredError()
    this.wsId = ctx.workspaceId
    this.docs = new DocumentRepository(ctx.workspaceId)
    this.payments = new PaymentRepository(ctx.workspaceId)
    this.activity = new ActivityService(ctx)
  }

  /** Payment history for a document (newest first). */
  async list(documentId: string): Promise<PaymentOutputDTO[]> {
    await this.docs.requireById(documentId) // tenant + existence check
    const rows = await this.payments.listByDocument(documentId)
    return rows.map(toPaymentDTO)
  }

  /**
   * Record a payment; recompute paid amount + status from all allocations.
   *
   * `gateway` is optional. When omitted the payment is a MANUAL entry (existing behavior).
   * When supplied (e.g. a verified Razorpay capture) the payment carries the gateway's
   * `provider`/`providerRef`, and `idempotencyKey` makes the call safe to retry — a repeated
   * webhook/callback with the same key returns the already-recorded result without double-charging.
   */
  async record(
    documentId: string,
    input: RecordPaymentBody,
    gateway?: { provider: 'RAZORPAY' | 'STRIPE'; providerRef: string; idempotencyKey: string },
  ): Promise<RecordPaymentResult> {
    const doc = await this.docs.requireById(documentId)

    // Idempotency: a gateway payment already recorded under this key is returned as-is.
    if (gateway?.idempotencyKey) {
      const existing = await this.payments.findByIdempotencyKey(gateway.idempotencyKey)
      if (existing) {
        const current = await this.docs.findByIdWithItems(documentId)
        if (!current) throw new NotFoundError('Document', { id: documentId })
        return { payment: toPaymentDTO(existing), document: toDocumentDetailDTO(current) }
      }
    }

    const total = decimalToNumber(doc.total)
    const already = decimalToNumber(doc.amountPaid)
    const balance = roundTo(total - already)
    const amount = roundTo(input.amount)
    if (amount <= 0) throw new BadRequestError('Payment amount must be positive')
    if (amount > balance + 0.005) {
      throw new BadRequestError(`Amount exceeds the remaining balance of ${balance.toFixed(2)}`)
    }

    const payment = await runInTransaction(async (tx) => {
      const payments = new PaymentRepository(this.wsId, tx)
      const docs = new DocumentRepository(this.wsId, tx)
      const created = await payments.create({
        amount,
        currency: doc.currency,
        method: input.method,
        provider: gateway?.provider ?? 'MANUAL',
        status: 'SUCCEEDED',
        idempotencyKey:
          gateway?.idempotencyKey ??
          `pay_${documentId}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        providerRef: gateway?.providerRef ?? (input.reference?.trim() || null),
        receivedAt: input.receivedAt ? new Date(input.receivedAt) : new Date(),
        allocations: { create: [{ documentId, amount }] },
      })
      const paid = await payments.sumAllocatedForDocument(documentId)
      // Status derived from payments: fully covered → PAID; some → PARTIALLY_PAID; none → keep.
      const nextStatus =
        paid >= total - 0.005 ? 'PAID' : paid > 0.005 ? 'PARTIALLY_PAID' : doc.status === 'DRAFT' ? 'SENT' : doc.status
      await docs.update(documentId, { amountPaid: paid, status: nextStatus })
      return created
    })

    const updated = await this.docs.findByIdWithItems(documentId)
    if (!updated) throw new NotFoundError('Document', { id: documentId })
    await this.activity
      .record({
        verb: 'payment.recorded',
        summary: `Recorded ${doc.currency} ${amount.toFixed(2)} on ${updated.number}`,
        relatedType: 'Document',
        relatedId: documentId,
      })
      .catch(() => undefined)

    // Best-effort payment confirmation email (never blocks recording; EmailService never throws).
    const recipient = readRecipientEmail(updated.recipient)
    if (recipient) {
      const paidNow = decimalToNumber(updated.amountPaid)
      await new EmailService()
        .sendPaymentConfirmation(
          recipient,
          {
            number: updated.number,
            amount: `${doc.currency} ${amount.toFixed(2)}`,
            balance: `${doc.currency} ${Math.max(0, total - paidNow).toFixed(2)}`,
          },
          this.wsId,
          documentId,
        )
        .catch(() => undefined)
    }

    return { payment: toPaymentDTO(payment), document: toDocumentDetailDTO(updated) }
  }
}
