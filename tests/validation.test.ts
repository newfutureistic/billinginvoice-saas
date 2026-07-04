import { test } from 'node:test'
import assert from 'node:assert/strict'

import { clientCreateSchema } from '@/lib/validation/client.schema'
import { invoiceCreateSchema } from '@/lib/validation/invoice.schema'
import { paginationQuerySchema } from '@/lib/validation/common.schema'
import { productCreateSchema } from '@/lib/validation/product.schema'

test('clientCreateSchema: valid input + default status', () => {
  const parsed = clientCreateSchema.parse({ name: 'Acme' })
  assert.equal(parsed.name, 'Acme')
  assert.equal(parsed.status, 'active')
})

test('clientCreateSchema: rejects empty name and bad email', () => {
  assert.equal(clientCreateSchema.safeParse({}).success, false)
  assert.equal(clientCreateSchema.safeParse({ name: 'A', email: 'not-an-email' }).success, false)
})

test('productCreateSchema: rejects negative price', () => {
  assert.equal(productCreateSchema.safeParse({ name: 'X', sku: 'S1', price: -1 }).success, false)
  assert.equal(productCreateSchema.safeParse({ name: 'X', sku: 'S1', price: 10 }).success, true)
})

test('invoiceCreateSchema: requires at least one item', () => {
  const base = {
    issueDate: '2024-01-01',
    currency: 'USD',
    business: { businessName: 'Me' },
    client: { clientName: 'You' },
    tax: { type: 'GST', rate: 10, basis: 'exclusive' },
  }
  assert.equal(invoiceCreateSchema.safeParse({ ...base, items: [] }).success, false)
  assert.equal(
    invoiceCreateSchema.safeParse({ ...base, items: [{ description: 'Work', quantity: 1, rate: 100 }] }).success,
    true,
  )
})

test('paginationQuerySchema: coerces strings and applies defaults', () => {
  assert.deepEqual(paginationQuerySchema.parse({}), { page: 1, pageSize: 20 })
  assert.deepEqual(paginationQuerySchema.parse({ page: '3', pageSize: '50' }), { page: 3, pageSize: 50 })
})
