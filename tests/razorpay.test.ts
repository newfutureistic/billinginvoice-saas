import { test } from 'node:test'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'

import {
  verifyPaymentSignature,
  verifyWebhookSignature,
  signPayload,
} from '@/server/adapters/razorpay'

const SECRET = 'rzp_test_secret_123'

test('razorpay: payment signature follows the documented order_id|payment_id HMAC', () => {
  const orderId = 'order_ABC123'
  const paymentId = 'pay_XYZ789'
  // Independent reference HMAC (not via the adapter) proves the payload format + algorithm.
  const expected = crypto
    .createHmac('sha256', SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex')
  assert.equal(signPayload(`${orderId}|${paymentId}`, SECRET), expected)
  assert.equal(verifyPaymentSignature(orderId, paymentId, expected, SECRET), true)
})

test('razorpay: payment signature rejects a forged payment id', () => {
  const orderId = 'order_ABC123'
  const sig = signPayload(`${orderId}|pay_REAL`, SECRET)
  assert.equal(verifyPaymentSignature(orderId, 'pay_FORGED', sig, SECRET), false)
})

test('razorpay: payment signature rejects the wrong secret', () => {
  const sig = signPayload('order_1|pay_1', SECRET)
  assert.equal(verifyPaymentSignature('order_1', 'pay_1', sig, 'wrong_secret'), false)
})

test('razorpay: payment signature rejects an empty signature', () => {
  assert.equal(verifyPaymentSignature('order_1', 'pay_1', '', SECRET), false)
})

test('razorpay: webhook signature verifies the raw body HMAC', () => {
  const body = JSON.stringify({
    event: 'payment.captured',
    payload: { payment: { entity: { id: 'pay_1', amount: 10000 } } },
  })
  const sig = crypto.createHmac('sha256', SECRET).update(body).digest('hex')
  assert.equal(verifyWebhookSignature(body, sig, SECRET), true)
})

test('razorpay: webhook signature rejects a modified body (amount tampering)', () => {
  const body = JSON.stringify({ event: 'payment.captured', amount: 10000 })
  const sig = signPayload(body, SECRET)
  const tampered = JSON.stringify({ event: 'payment.captured', amount: 999999 })
  assert.equal(verifyWebhookSignature(tampered, sig, SECRET), false)
})

test('razorpay: signature comparison is length-safe (no throw on mismatched lengths)', () => {
  assert.equal(verifyPaymentSignature('o', 'p', 'short', SECRET), false)
  assert.equal(verifyWebhookSignature('{}', 'x', SECRET), false)
})
