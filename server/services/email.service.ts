import type { EmailKind } from '@prisma/client'
import { emailProvider, type EmailProvider } from '@/server/adapters/email'
import { EmailRepository } from '@/server/repositories/email.repository'
import {
  verifyEmailTemplate,
  resetPasswordTemplate,
  inviteTemplate,
  invoiceSentTemplate,
  systemTemplate,
  type RenderedEmail,
  type InvoiceEmailData,
} from '@/server/email/templates'
import { getAppUrl } from '@/server/config/env'
import { dbLogger } from '@/server/db/logger'

export interface SendEmailInput {
  to: string
  kind: EmailKind
  templateKey: string
  rendered: RenderedEmail
  workspaceId?: string | null
  relatedType?: string
  relatedId?: string
}

export interface SendResult {
  sent: boolean
  id: string | null
}

/**
 * Email service (Mission 7). Renders a template, records an `EmailMessage` (queued →
 * sent/failed), and dispatches through the configured {@link EmailProvider}. Two hard
 * guarantees:
 *  1. **Never throws** — a delivery failure must not break signup/login/invite flows; it
 *     is logged and recorded as FAILED.
 *  2. **Never reports false success** — if no provider is configured (`isEnabled()` is
 *     false, e.g. `RESEND_API_KEY` unset → Noop), nothing is delivered, so the record is
 *     left QUEUED and `send` returns `{ sent: false }` (BUG-2 fix).
 * Convenience methods cover the auth + document emails and reuse the pure templates.
 */
export class EmailService {
  constructor(
    private readonly provider: EmailProvider = emailProvider,
    private readonly repo: EmailRepository = new EmailRepository(),
  ) {}

  async send(input: SendEmailInput): Promise<SendResult> {
    let recordId: string | null = null
    try {
      const record = await this.repo.create({
        workspaceId: input.workspaceId ?? null,
        toEmail: input.to,
        kind: input.kind,
        templateKey: input.templateKey,
        relatedType: input.relatedType ?? null,
        relatedId: input.relatedId ?? null,
        provider: this.provider.name,
        status: 'QUEUED',
      })
      recordId = record.id
    } catch (err) {
      dbLogger.warn('email.record_failed', { error: err instanceof Error ? err.message : String(err) })
    }

    // No configured provider (e.g. RESEND_API_KEY unset → Noop) can deliver anything.
    // Never report success for an email that was not sent: leave the record QUEUED
    // (honest — queued, never delivered) and return `sent: false`.
    if (!this.provider.isEnabled()) {
      dbLogger.info('email.not_sent (provider not configured)', {
        to: input.to,
        kind: input.kind,
        provider: this.provider.name,
      })
      return { sent: false, id: null }
    }

    try {
      const result = await this.provider.send({
        to: input.to,
        subject: input.rendered.subject,
        html: input.rendered.html,
        text: input.rendered.text,
      })
      if (recordId) {
        await this.repo
          .updateStatus(recordId, 'SENT', { providerMessageId: result.id ?? undefined, sentAt: new Date() })
          .catch(() => undefined)
      }
      return { sent: true, id: result.id }
    } catch (err) {
      if (recordId) await this.repo.updateStatus(recordId, 'FAILED').catch(() => undefined)
      dbLogger.error('email.send_failed', {
        to: input.to,
        kind: input.kind,
        error: err instanceof Error ? err.message : String(err),
      })
      return { sent: false, id: null }
    }
  }

  // --- convenience (reuse the pure templates) ------------------------------

  sendVerification(to: string, code: string, workspaceId?: string): Promise<SendResult> {
    return this.send({ to, kind: 'VERIFY', templateKey: 'verify', rendered: verifyEmailTemplate(code), workspaceId })
  }

  sendPasswordReset(to: string, token: string): Promise<SendResult> {
    const url = `${getAppUrl()}/auth/reset-password?token=${encodeURIComponent(token)}`
    return this.send({ to, kind: 'RESET', templateKey: 'reset', rendered: resetPasswordTemplate(url) })
  }

  sendInvite(to: string, token: string, workspaceName: string, role: string, workspaceId?: string): Promise<SendResult> {
    const url = `${getAppUrl()}/invite?token=${encodeURIComponent(token)}`
    return this.send({
      to,
      kind: 'INVITE',
      templateKey: 'invite',
      rendered: inviteTemplate(url, workspaceName || 'a workspace', role),
      workspaceId,
    })
  }

  sendInvoice(to: string, data: InvoiceEmailData, workspaceId: string, documentId: string): Promise<SendResult> {
    return this.send({
      to,
      kind: 'INVOICE_SENT',
      templateKey: 'invoice_sent',
      rendered: invoiceSentTemplate(data),
      workspaceId,
      relatedType: 'Document',
      relatedId: documentId,
    })
  }

  sendSystem(to: string, subject: string, message: string, workspaceId?: string): Promise<SendResult> {
    return this.send({ to, kind: 'SYSTEM', templateKey: 'system', rendered: systemTemplate(subject, message), workspaceId })
  }

  /** Payment receipt email (reuses the system template + Resend provider). */
  sendReceipt(
    to: string,
    data: { number: string; receiptNumber: string; paid: string; balance: string },
    workspaceId: string,
    documentId: string,
  ): Promise<SendResult> {
    const message =
      `Receipt ${data.receiptNumber} for invoice ${data.number}.\n\n` +
      `Amount received: ${data.paid}\nBalance due: ${data.balance}\n\nThank you for your payment.`
    return this.send({
      to,
      kind: 'SYSTEM',
      templateKey: 'payment_receipt',
      rendered: systemTemplate(`Receipt ${data.receiptNumber}`, message),
      workspaceId,
      relatedType: 'Document',
      relatedId: documentId,
    })
  }

  /** Payment confirmation email sent when a payment is recorded. */
  sendPaymentConfirmation(
    to: string,
    data: { number: string; amount: string; balance: string },
    workspaceId: string,
    documentId: string,
  ): Promise<SendResult> {
    const message =
      `We received a payment of ${data.amount} for invoice ${data.number}.\n\n` +
      `Remaining balance: ${data.balance}.\n\nThank you.`
    return this.send({
      to,
      kind: 'SYSTEM',
      templateKey: 'payment_confirmation',
      rendered: systemTemplate(`Payment received for ${data.number}`, message),
      workspaceId,
      relatedType: 'Document',
      relatedId: documentId,
    })
  }
}
