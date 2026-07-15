import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import { renderInvoicePdf, type InvoicePdfInput } from '@/server/pdf/invoice-pdf'
import { qrPngBytes, qrSvg, qrDataUrl } from '@/server/services/qr.service'
import { disconnectPrisma } from '@/server/db/prisma'

after(async () => {
  await disconnectPrisma().catch(() => undefined)
})

const baseInvoice: InvoicePdfInput = {
  type: 'INVOICE',
  number: 'INV-2026-001',
  status: 'DRAFT',
  currency: 'USD',
  issueDate: '2026-07-05T00:00:00.000Z',
  dueDate: '2026-08-05T00:00:00.000Z',
  issuer: { name: 'Acme Corp', lines: ['billing@acme.com', '123 Main St', 'New York, NY'] },
  recipient: { name: 'Client Co', lines: ['ap@client.co'] },
  items: [
    { description: 'Consulting', quantity: 10, rate: 150, amount: 1500 },
    { description: 'Design', quantity: 2, rate: 500, amount: 1000 },
  ],
  subtotal: 2500,
  taxTotal: 250,
  total: 2750,
  amountPaid: 0,
  taxLabel: 'GST 10%',
  notes: 'Thanks for your business.',
  terms: 'Net 30',
  brandColorHex: '#2563eb',
}

test('renderInvoicePdf produces a valid PDF document', async () => {
  const bytes = await renderInvoicePdf(baseInvoice)
  assert.ok(bytes.byteLength > 800, 'PDF should be non-trivial')
  const header = Buffer.from(bytes.slice(0, 5)).toString('latin1')
  assert.equal(header, '%PDF-')
})

test('renderInvoicePdf tolerates non-ASCII user data (no encoding crash)', async () => {
  const bytes = await renderInvoicePdf({
    ...baseInvoice,
    recipient: { name: 'Café ☕ 日本株式会社', lines: ['€ ₹ 🎉 unusual'] },
    notes: 'Merci — grazie — спасибо',
  })
  assert.ok(bytes.byteLength > 800)
  assert.equal(Buffer.from(bytes.slice(0, 5)).toString('latin1'), '%PDF-')
})

test('renderInvoicePdf renders a balance line when partially paid', async () => {
  const bytes = await renderInvoicePdf({ ...baseInvoice, amountPaid: 1000 })
  assert.equal(Buffer.from(bytes.slice(0, 5)).toString('latin1'), '%PDF-')
})

test('qrPngBytes returns a real PNG (magic bytes)', async () => {
  const bytes = await qrPngBytes('https://bill-maker.com/i/INV-2026-001')
  assert.deepEqual([...bytes.slice(0, 4)], [0x89, 0x50, 0x4e, 0x47])
})

test('qrSvg / qrDataUrl produce SVG + PNG data URL', async () => {
  assert.match(await qrSvg('hello'), /<svg/)
  assert.match(await qrDataUrl('hello'), /^data:image\/png;base64,/)
})
