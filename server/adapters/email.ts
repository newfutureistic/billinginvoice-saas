import { Resend } from 'resend'
import { getIntegrationsEnv, isEmailEnabled } from '@/server/config/env'
import { dbLogger } from '@/server/db/logger'

/**
 * Email provider adapter (Mission 7) — provider-agnostic, configured through env only.
 * The concrete provider is **Resend**; swapping to SES/Postmark is a change to this file.
 * When `RESEND_API_KEY` is absent the `Noop` provider logs instead of sending, so the app
 * runs in every environment and delivery is enabled purely by setting the env var.
 */
export interface OutboundEmail {
  to: string
  subject: string
  html: string
  text: string
}

export interface EmailSendResult {
  id: string | null
  provider: string
}

export interface EmailProvider {
  readonly name: string
  isEnabled(): boolean
  send(email: OutboundEmail): Promise<EmailSendResult>
}

export class ResendEmailProvider implements EmailProvider {
  readonly name = 'resend'
  private client: Resend | null = null

  isEnabled(): boolean {
    return isEmailEnabled()
  }

  private getClient(): Resend {
    const key = getIntegrationsEnv().RESEND_API_KEY
    if (!key) throw new Error('RESEND_API_KEY is not configured')
    this.client ??= new Resend(key)
    return this.client
  }

  async send(email: OutboundEmail): Promise<EmailSendResult> {
    const env = getIntegrationsEnv()
    const { data, error } = await this.getClient().emails.send({
      from: env.EMAIL_FROM,
      to: email.to,
      subject: email.subject,
      html: email.html,
      text: email.text,
      ...(env.EMAIL_REPLY_TO ? { replyTo: env.EMAIL_REPLY_TO } : {}),
    })
    if (error) throw new Error(error.message)
    return { id: data?.id ?? null, provider: this.name }
  }
}

export class NoopEmailProvider implements EmailProvider {
  readonly name = 'noop'
  isEnabled(): boolean {
    return false
  }
  async send(email: OutboundEmail): Promise<EmailSendResult> {
    dbLogger.info('email.noop (not configured)', { to: email.to, subject: email.subject })
    return { id: null, provider: this.name }
  }
}

/** Process-wide provider — Resend when configured, else the logging no-op. */
export const emailProvider: EmailProvider = isEmailEnabled()
  ? new ResendEmailProvider()
  : new NoopEmailProvider()
