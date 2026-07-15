import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import {
  verifyEmailTemplate,
  resetPasswordTemplate,
  inviteTemplate,
  invoiceSentTemplate,
} from '@/server/email/templates'
import { EmailService } from '@/server/services/email.service'
import { NoopEmailProvider } from '@/server/adapters/email'
import type { EmailProvider, OutboundEmail, EmailSendResult } from '@/server/adapters/email'
import type { EmailRepository } from '@/server/repositories/email.repository'
import { disconnectPrisma } from '@/server/db/prisma'

after(async () => {
  await disconnectPrisma().catch(() => undefined)
})

// --- templates (pure) --------------------------------------------------------

test('verify template embeds the code', () => {
  const t = verifyEmailTemplate('123456')
  assert.match(t.subject, /verification/i)
  assert.match(t.html, /123456/)
  assert.match(t.text, /123456/)
})

test('reset template embeds + HTML-escapes the url', () => {
  const t = resetPasswordTemplate('https://app/reset?token=ab&c=1')
  assert.match(t.html, /token=ab&amp;c=1/)
  assert.match(t.text, /https:\/\/app\/reset/)
})

test('invite template shows workspace + role', () => {
  const t = inviteTemplate('https://app/invite?token=x', 'Acme', 'ADMIN')
  assert.match(t.subject, /Acme/)
  assert.match(t.html, /ADMIN/)
})

test('invoice template shows number, total and link', () => {
  const t = invoiceSentTemplate({ documentType: 'INVOICE', number: 'INV-1', total: 'USD 220.00', url: 'https://app/f' })
  assert.match(t.subject, /INV-1/)
  assert.match(t.html, /220\.00/)
  assert.match(t.html, /https:\/\/app\/f/)
})

// --- service (fake provider + repo) -----------------------------------------

function makeFakes(shouldFail = false) {
  const sent: OutboundEmail[] = []
  const records: string[] = []
  const provider: EmailProvider = {
    name: 'fake',
    isEnabled: () => true,
    async send(email: OutboundEmail): Promise<EmailSendResult> {
      if (shouldFail) throw new Error('smtp down')
      sent.push(email)
      return { id: 'msg_1', provider: 'fake' }
    },
  }
  let seq = 0
  const repo = {
    async create() {
      const id = `e${++seq}`
      records.push(`create:${id}`)
      return { id }
    },
    async updateStatus(id: string, status: string) {
      records.push(`status:${id}:${status}`)
      return {}
    },
  } as unknown as EmailRepository
  return { provider, repo, sent, records }
}

test('EmailService records + sends on success', async () => {
  const { provider, repo, sent, records } = makeFakes(false)
  const service = new EmailService(provider, repo)
  const result = await service.sendVerification('user@x.com', '000111')
  assert.equal(result.sent, true)
  assert.equal(result.id, 'msg_1')
  assert.equal(sent.length, 1)
  assert.match(sent[0].html, /000111/)
  assert.ok(records.includes('status:e1:SENT'))
})

test('EmailService never throws on provider failure (records FAILED)', async () => {
  const { provider, repo, records } = makeFakes(true)
  const service = new EmailService(provider, repo)
  const result = await service.sendPasswordReset('user@x.com', 'tok_123')
  assert.equal(result.sent, false)
  assert.ok(records.includes('status:e1:FAILED'))
})

// --- BUG-2: never report success when no provider is configured --------------

test('EmailService reports sent:false when the provider is disabled (no faked success)', async () => {
  const { provider, repo, sent, records } = makeFakes(false)
  provider.isEnabled = () => false // simulate unconfigured (Noop) provider
  const service = new EmailService(provider, repo)
  const result = await service.sendVerification('user@x.com', '000111')
  assert.equal(result.sent, false) // never true when nothing was sent
  assert.equal(result.id, null)
  assert.equal(sent.length, 0) // provider.send was NOT called → nothing delivered
  assert.ok(!records.some((r) => r.endsWith(':SENT'))) // record left QUEUED, never marked SENT
})

test('EmailService with the real NoopEmailProvider never reports sent', async () => {
  const { repo, records } = makeFakes(false)
  const service = new EmailService(new NoopEmailProvider(), repo)
  const result = await service.sendInvoice(
    'user@x.com',
    { documentType: 'INVOICE', number: 'INV-1', total: 'USD 10.00', url: 'https://app/f' },
    'ws_1',
    'doc_1',
  )
  assert.equal(result.sent, false)
  assert.equal(result.id, null)
  assert.ok(!records.some((r) => r.endsWith(':SENT')))
})
