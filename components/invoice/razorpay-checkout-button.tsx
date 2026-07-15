'use client'

import { useCallback, useRef, useState } from 'react'
import { CreditCard, Loader2, CheckCircle2, XCircle, RefreshCw, AlertCircle } from 'lucide-react'
import { useCreateRazorpayOrder, useVerifyRazorpayPayment, type RazorpayOrder } from '@/lib/api/hooks/use-payments'
import { ApiError } from '@/lib/api/errors'

const CHECKOUT_SRC = 'https://checkout.razorpay.com/v1/checkout.js'

/** Minimal shape of the Razorpay Checkout global (loaded from checkout.js at runtime). */
interface RazorpayCheckoutResponse {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}
interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  prefill?: { name?: string; email?: string }
  theme?: { color?: string }
  handler: (r: RazorpayCheckoutResponse) => void
  modal?: { ondismiss?: () => void }
}
interface RazorpayInstance {
  open: () => void
  on: (event: string, cb: (r: { error?: { description?: string; reason?: string } }) => void) => void
}
type RazorpayConstructor = new (options: RazorpayOptions) => RazorpayInstance
declare global {
  interface Window {
    Razorpay?: RazorpayConstructor
  }
}

/** Load checkout.js once; resolves when `window.Razorpay` is available. */
function loadCheckoutScript(): Promise<RazorpayConstructor> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('No window'))
    if (window.Razorpay) return resolve(window.Razorpay)
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${CHECKOUT_SRC}"]`)
    const onLoad = () => (window.Razorpay ? resolve(window.Razorpay) : reject(new Error('Razorpay failed to initialize')))
    if (existing) {
      existing.addEventListener('load', onLoad, { once: true })
      existing.addEventListener('error', () => reject(new Error('Could not load the payment library')), { once: true })
      if (window.Razorpay) resolve(window.Razorpay)
      return
    }
    const s = document.createElement('script')
    s.src = CHECKOUT_SRC
    s.async = true
    s.onload = onLoad
    s.onerror = () => reject(new Error('Could not load the payment library'))
    document.body.appendChild(s)
  })
}

type Phase = 'idle' | 'loading' | 'processing' | 'success' | 'failed' | 'cancelled' | 'network'

export interface RazorpayCheckoutButtonProps {
  documentId: string
  invoiceNumber: string
  balance: number
  currency: string
  prefillName?: string
  prefillEmail?: string
  /** Called after the capture is verified + recorded (parent shows receipt buttons / toast). */
  onPaid?: () => void
}

/**
 * Production checkout button: create order → open Razorpay Checkout → verify signature
 * server-side → record. All values that matter (amount, signature) are (re)verified by the
 * backend; the client never records a payment on its own. Fail-closed: if the gateway isn't
 * configured the order call returns 503 and we surface that — we never fake a success.
 */
export function RazorpayCheckoutButton({
  documentId,
  invoiceNumber,
  balance,
  currency,
  prefillName,
  prefillEmail,
  onPaid,
}: RazorpayCheckoutButtonProps) {
  const createOrder = useCreateRazorpayOrder(documentId)
  const verify = useVerifyRazorpayPayment(documentId)
  const [phase, setPhase] = useState<Phase>('idle')
  const [message, setMessage] = useState<string | null>(null)
  // Duplicate-payment protection: block re-entry while a checkout is already in flight.
  const inFlight = useRef(false)

  const busy = phase === 'loading' || phase === 'processing'

  const verifyCapture = useCallback(
    async (r: RazorpayCheckoutResponse) => {
      setPhase('processing')
      setMessage('Verifying payment…')
      try {
        await verify.mutateAsync({
          orderId: r.razorpay_order_id,
          paymentId: r.razorpay_payment_id,
          signature: r.razorpay_signature,
        })
        setPhase('success')
        setMessage('Payment successful — invoice updated.')
        onPaid?.()
      } catch (err) {
        // Never corrupt invoice status: a failed verification records nothing.
        setPhase('failed')
        setMessage(err instanceof ApiError ? err.message : 'We could not verify this payment. No charge was recorded.')
      } finally {
        inFlight.current = false
      }
    },
    [verify, onPaid],
  )

  const start = useCallback(async () => {
    if (inFlight.current) return // duplicate protection
    inFlight.current = true
    setPhase('loading')
    setMessage(null)

    let order: RazorpayOrder
    try {
      order = await createOrder.mutateAsync()
    } catch (err) {
      inFlight.current = false
      // 503 → gateway not configured; anything else → network/server. Honest, no fake success.
      if (err instanceof ApiError) {
        setPhase(err.status === 503 ? 'failed' : 'network')
        setMessage(err.status === 503 ? 'Online payments are not configured yet.' : err.message)
      } else {
        setPhase('network')
        setMessage('Network error while starting checkout. Please try again.')
      }
      return
    }

    let Razorpay: RazorpayConstructor
    try {
      Razorpay = await loadCheckoutScript()
    } catch (err) {
      inFlight.current = false
      setPhase('network')
      setMessage(err instanceof Error ? err.message : 'Could not load the payment library')
      return
    }

    setPhase('processing')
    setMessage('Opening secure checkout…')
    const rzp = new Razorpay({
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      name: 'Bill Maker',
      description: `Invoice ${order.number}`,
      order_id: order.orderId,
      prefill: { name: prefillName, email: prefillEmail },
      theme: { color: '#4f46e5' },
      handler: (resp) => void verifyCapture(resp),
      modal: {
        ondismiss: () => {
          inFlight.current = false
          setPhase('cancelled')
          setMessage('Checkout cancelled. You can retry when ready.')
        },
      },
    })
    rzp.on('payment.failed', (resp) => {
      inFlight.current = false
      setPhase('failed')
      setMessage(resp?.error?.description || 'The payment failed. Please retry.')
    })
    rzp.open()
  }, [createOrder, verifyCapture, prefillName, prefillEmail])

  if (phase === 'success') {
    return (
      <div className="mt-4 flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm font-medium text-success" role="status">
        <CheckCircle2 className="size-4 shrink-0" />
        {message}
      </div>
    )
  }

  const isError = phase === 'failed' || phase === 'network' || phase === 'cancelled'

  return (
    <div className="mt-4 space-y-2">
      <button
        onClick={start}
        disabled={busy}
        aria-busy={busy}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground hover:bg-brand/90 disabled:opacity-60"
      >
        {phase === 'loading' && <><Loader2 className="size-4 animate-spin" /> Preparing…</>}
        {phase === 'processing' && <><Loader2 className="size-4 animate-spin" /> Processing…</>}
        {!busy && !isError && <><CreditCard className="size-4" /> Pay Now · {currency} {balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</>}
        {!busy && isError && <><RefreshCw className="size-4" /> Retry Payment</>}
      </button>
      {message && isError && (
        <p
          className={`flex items-start gap-1.5 text-xs ${phase === 'cancelled' ? 'text-muted-foreground' : 'text-destructive'}`}
          role="alert"
        >
          {phase === 'cancelled' ? <AlertCircle className="mt-px size-3.5 shrink-0" /> : <XCircle className="mt-px size-3.5 shrink-0" />}
          {message}
        </p>
      )}
    </div>
  )
}
