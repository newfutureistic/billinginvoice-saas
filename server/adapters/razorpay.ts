import crypto from 'node:crypto'
import { getIntegrationsEnv, isRazorpayEnabled } from '@/server/config/env'

/**
 * Razorpay adapter (Mission 8). Thin, dependency-free integration:
 *  - order creation via Razorpay's REST API (no SDK), gated on configuration,
 *  - HMAC-SHA256 signature verification for the Checkout callback and for webhooks.
 * The signature helpers are pure (accept an explicit secret for testing) so the
 * security-critical logic is unit-testable without live credentials.
 */
const RAZORPAY_API = 'https://api.razorpay.com/v1'

export interface RazorpayOrder {
  id: string
  amount: number
  currency: string
  receipt?: string
  status: string
}

export function getRazorpayKeyId(): string | null {
  return getIntegrationsEnv().RAZORPAY_KEY_ID ?? null
}

/** Create a Razorpay order. `amountMinor` is in the currency's smallest unit (e.g. paise). */
export async function createRazorpayOrder(input: {
  amountMinor: number
  currency: string
  receipt: string
  notes?: Record<string, string>
}): Promise<RazorpayOrder> {
  const env = getIntegrationsEnv()
  if (!isRazorpayEnabled() || !env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay is not configured')
  }
  const auth = Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString('base64')
  const res = await fetch(`${RAZORPAY_API}/orders`, {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: input.amountMinor,
      currency: input.currency,
      receipt: input.receipt,
      notes: input.notes,
      payment_capture: 1,
    }),
  })
  if (!res.ok) throw new Error(`Razorpay order creation failed (${res.status})`)
  return (await res.json()) as RazorpayOrder
}

function hmacHex(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex')
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb)
}

/**
 * Verify the Razorpay Checkout callback signature:
 * `HMAC_SHA256(order_id + "|" + payment_id, key_secret) === razorpay_signature`.
 */
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret?: string,
): boolean {
  const key = secret ?? getIntegrationsEnv().RAZORPAY_KEY_SECRET
  if (!key || !signature) return false
  return safeEqual(hmacHex(`${orderId}|${paymentId}`, key), signature)
}

/** Verify a Razorpay webhook: `HMAC_SHA256(rawBody, webhook_secret) === x-razorpay-signature`. */
export function verifyWebhookSignature(rawBody: string, signature: string, secret?: string): boolean {
  const key = secret ?? getIntegrationsEnv().RAZORPAY_WEBHOOK_SECRET
  if (!key || !signature) return false
  return safeEqual(hmacHex(rawBody, key), signature)
}

/** Compute a signature (used by tests / trusted callers). */
export function signPayload(payload: string, secret: string): string {
  return hmacHex(payload, secret)
}
