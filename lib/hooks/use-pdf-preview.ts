'use client'

import { useEffect, useState } from 'react'
import type { InvoiceData } from '@/lib/invoice-types'

/**
 * Renders the invoice through the real PDF engine and hands back a blob URL to display.
 *
 * The preview used to be a second, hand-written HTML renderer, so it drifted from the exported
 * document (a "Classic" invoice previewed blue-and-modern but exported navy-and-gold). Showing
 * the actual PDF makes the preview and the export the same artifact by construction.
 */
export type PdfPreviewStatus =
  | 'loading' // no PDF yet
  | 'ready' // showing the current invoice
  | 'stale' // showing the last good PDF; the newest edit could not be rendered
  | 'error' // nothing renderable yet

/**
 * Shared across every mounted preview. The builder mounts two (the desktop pane, which stays
 * mounted but CSS-hidden on small screens, and the mobile overlay), and the render route is
 * rate limited — so identical payloads must resolve to one request.
 */
let lastKey: string | null = null
let lastUrl: string | null = null
let inflightKey: string | null = null
let inflight: Promise<string | null> | null = null

async function renderToBlobUrl(key: string): Promise<string | null> {
  if (key === lastKey && lastUrl) return lastUrl
  if (key === inflightKey && inflight) return inflight

  inflightKey = key
  inflight = (async () => {
    try {
      const res = await fetch('/api/v1/invoice/render-pdf', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: key,
      })
      // 422 (incomplete invoice) / 429 (rate limited) → keep whatever we last rendered.
      if (!res.ok) return null
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const previous = lastUrl
      lastKey = key
      lastUrl = url
      // Revoke the old object URL only after the iframe has had time to swap to the new one.
      if (previous) window.setTimeout(() => URL.revokeObjectURL(previous), 2000)
      return url
    } catch {
      return null
    } finally {
      inflightKey = null
      inflight = null
    }
  })()
  return inflight
}

/** Debounced PDF preview for `invoice`. */
export function usePdfPreview(invoice: InvoiceData, delay = 800) {
  const [url, setUrl] = useState<string | null>(lastUrl)
  const [status, setStatus] = useState<PdfPreviewStatus>(lastUrl ? 'ready' : 'loading')
  const key = JSON.stringify(invoice)

  useEffect(() => {
    let cancelled = false
    // Already rendered this exact invoice (e.g. a second preview mounted) — no request at all.
    if (key === lastKey && lastUrl) {
      setUrl(lastUrl)
      setStatus('ready')
      return
    }
    const timer = window.setTimeout(async () => {
      const next = await renderToBlobUrl(key)
      if (cancelled) return
      if (next) {
        setUrl(next)
        setStatus('ready')
      } else {
        // Deliberately keep the last good PDF on screen rather than blanking the pane.
        setStatus(lastUrl ? 'stale' : 'error')
        if (lastUrl) setUrl(lastUrl)
      }
    }, delay)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [key, delay])

  return { url, status }
}
