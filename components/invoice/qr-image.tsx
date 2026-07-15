'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

/**
 * Client-side QR renderer for the invoice builder. Turns any string (a payment/UPI
 * link, a "view invoice" URL, contact vCard, etc.) into a scannable PNG data URL via
 * the `qrcode` browser build — no network, no server round-trip. Renders nothing while
 * the value is empty so callers can drop it in unconditionally.
 */
export function QrImage({
  value,
  size = 128,
  className,
  onEmpty = null,
}: {
  value: string | undefined
  size?: number
  className?: string
  /** What to render when `value` is empty or generation fails. */
  onEmpty?: React.ReactNode
}) {
  const [src, setSrc] = useState<string | null>(null)
  const data = (value ?? '').trim()

  useEffect(() => {
    let active = true
    if (!data) {
      setSrc(null)
      return
    }
    QRCode.toDataURL(data, { width: size * 2, margin: 1, errorCorrectionLevel: 'M' })
      .then((url) => active && setSrc(url))
      .catch(() => active && setSrc(null))
    return () => {
      active = false
    }
  }, [data, size])

  if (!src) return <>{onEmpty}</>
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="QR code" width={size} height={size} className={className} />
  )
}
