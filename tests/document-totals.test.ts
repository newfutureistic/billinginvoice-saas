import { test } from 'node:test'
import assert from 'node:assert/strict'
import { computeDocumentTotals } from '@/server/utils/document-totals'

const items = [{ quantity: 2, rate: 100 }] // subtotal 200

test('exclusive tax adds on top of the subtotal', () => {
  const t = computeDocumentTotals(items, { rate: 10, basis: 'exclusive' })
  assert.equal(t.subtotal, 200)
  assert.equal(t.taxableBase, 200)
  assert.equal(t.taxTotal, 20)
  assert.equal(t.total, 220)
})

test('inclusive tax is extracted from within the subtotal', () => {
  const t = computeDocumentTotals(items, { rate: 10, basis: 'inclusive' })
  assert.equal(t.subtotal, 200)
  assert.equal(t.taxTotal, 18.18)
  assert.equal(t.total, 200) // inclusive: total equals the (taxable) base
})

test('percentage discount reduces the taxable base', () => {
  const t = computeDocumentTotals(
    items,
    { rate: 10, basis: 'exclusive' },
    { type: 'percentage', value: 10, applied: true },
  )
  assert.equal(t.discountAmount, 20)
  assert.equal(t.taxableBase, 180)
  assert.equal(t.taxTotal, 18)
  assert.equal(t.total, 198)
})

test('fixed discount is clamped to the subtotal', () => {
  const t = computeDocumentTotals(
    [{ quantity: 1, rate: 100 }],
    { rate: 0, basis: 'exclusive' },
    { type: 'fixed', value: 150, applied: true },
  )
  assert.equal(t.discountAmount, 100)
  assert.equal(t.taxableBase, 0)
  assert.equal(t.total, 0)
})

test('shipping is added after tax (exclusive)', () => {
  const t = computeDocumentTotals(
    [{ quantity: 1, rate: 100 }],
    { rate: 10, basis: 'exclusive' },
    undefined,
    { cost: 25, applied: true },
  )
  assert.equal(t.taxTotal, 10)
  assert.equal(t.shippingAmount, 25)
  assert.equal(t.total, 135)
})

test('unapplied discount/shipping are ignored', () => {
  const t = computeDocumentTotals(
    items,
    { rate: 0, basis: 'exclusive' },
    { type: 'fixed', value: 50, applied: false },
    { cost: 30, applied: false },
  )
  assert.equal(t.discountAmount, 0)
  assert.equal(t.shippingAmount, 0)
  assert.equal(t.total, 200)
})
