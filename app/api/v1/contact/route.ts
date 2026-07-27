import { defineRoute } from '@/server/http/handler'
import { EmailService } from '@/server/services/email.service'
import { contactFormSchema, type ContactFormInput } from '@/lib/validation/contact.schema'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Inbox that receives every public contact-form submission. */
const CONTACT_INBOX = 'billmaker.business@gmail.com'

/**
 * POST /api/v1/contact — the public "Contact us" form (marketing site, no auth). Emails
 * the submission straight to the support inbox; never persisted, there's no workspace to
 * attach it to.
 */
export const POST = defineRoute<{ ok: true }, ContactFormInput>({
  schema: { body: contactFormSchema },
  csrf: true,
  rateLimit: { limit: 5, windowMs: 60_000 },
  handler: async ({ body }) => {
    const message = [
      `From: ${body.firstName} ${body.lastName} <${body.email}>`,
      `Topic: ${body.topic}`,
      '',
      body.message,
    ].join('\n')

    await new EmailService().sendSystem(
      CONTACT_INBOX,
      `Contact form: ${body.topic} — ${body.firstName} ${body.lastName}`,
      message,
    )

    return { ok: true }
  },
})
