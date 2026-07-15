/**
 * Reusable email templates (Mission 7). Pure functions — each returns `{ subject, html,
 * text }` with no side effects, so they render offline and are unit-testable. A shared
 * `layout()` gives every message a consistent, email-client-safe (inline-styled) shell.
 * These are new assets (not the frozen product UI) so styling them is in scope.
 */
export interface RenderedEmail {
  subject: string
  html: string
  text: string
}

const BRAND = '#2563eb'
const INK = '#1f2430'
const MUTED = '#6b7280'

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function layout(title: string, bodyHtml: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f3f4f6;font-family:Helvetica,Arial,sans-serif;color:${INK}">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 0">
    <tr><td align="center">
      <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e5e7eb">
        <tr><td style="padding:24px 32px;border-bottom:1px solid #eef0f3">
          <span style="font-size:18px;font-weight:700;color:${BRAND}">Bill Maker</span>
        </td></tr>
        <tr><td style="padding:28px 32px">
          <h1 style="margin:0 0 12px;font-size:20px;color:${INK}">${esc(title)}</h1>
          ${bodyHtml}
        </td></tr>
        <tr><td style="padding:20px 32px;border-top:1px solid #eef0f3;color:${MUTED};font-size:12px">
          Sent by Bill Maker · If you didn't expect this email you can ignore it.
        </td></tr>
      </table>
    </td></tr>
  </table></body></html>`
}

function button(label: string, url: string): string {
  return `<a href="${esc(url)}" style="display:inline-block;background:${BRAND};color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:600;font-size:14px">${esc(label)}</a>`
}

function p(text: string): string {
  return `<p style="margin:0 0 14px;font-size:14px;line-height:1.6;color:${INK}">${esc(text)}</p>`
}

// --- Auth --------------------------------------------------------------------

export function verifyEmailTemplate(code: string): RenderedEmail {
  const html = layout(
    'Verify your email',
    p('Enter this 6-digit code to verify your email address:') +
      `<div style="font-size:30px;letter-spacing:8px;font-weight:700;color:${BRAND};margin:8px 0 16px">${esc(code)}</div>` +
      p('This code expires in 15 minutes.'),
  )
  return { subject: 'Your Bill Maker verification code', html, text: `Your verification code is ${code} (expires in 15 minutes).` }
}

export function resetPasswordTemplate(url: string): RenderedEmail {
  const html = layout(
    'Reset your password',
    p('We received a request to reset your Bill Maker password. Click below to choose a new one:') +
      `<div style="margin:8px 0 16px">${button('Reset password', url)}</div>` +
      p('This link expires in 30 minutes. If you didn\'t request it, ignore this email.'),
  )
  return { subject: 'Reset your Bill Maker password', html, text: `Reset your password: ${url} (expires in 30 minutes).` }
}

export function inviteTemplate(url: string, workspaceName: string, role: string): RenderedEmail {
  const html = layout(
    `You're invited to ${workspaceName}`,
    p(`You've been invited to join "${workspaceName}" on Bill Maker as ${role}.`) +
      `<div style="margin:8px 0 16px">${button('Accept invitation', url)}</div>`,
  )
  return {
    subject: `You're invited to ${workspaceName} on Bill Maker`,
    html,
    text: `You've been invited to ${workspaceName} as ${role}. Accept: ${url}`,
  }
}

// --- Documents ---------------------------------------------------------------

export interface InvoiceEmailData {
  documentType: string
  number: string
  total: string
  url?: string
}

export function invoiceSentTemplate(data: InvoiceEmailData): RenderedEmail {
  const label = data.documentType.replace('_', ' ').toLowerCase()
  const html = layout(
    `${data.documentType} ${data.number}`,
    p(`A new ${label} (${data.number}) is ready. Total due: ${data.total}.`) +
      (data.url ? `<div style="margin:8px 0 16px">${button('View & download', data.url)}</div>` : ''),
  )
  return {
    subject: `${data.documentType} ${data.number} — ${data.total}`,
    html,
    text: `${data.documentType} ${data.number} — total ${data.total}.${data.url ? ` View: ${data.url}` : ''}`,
  }
}

// --- Generic -----------------------------------------------------------------

export function systemTemplate(subject: string, message: string): RenderedEmail {
  return { subject, html: layout(subject, p(message)), text: message }
}
