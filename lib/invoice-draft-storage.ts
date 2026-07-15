import type { InvoiceData } from '@/lib/invoice-types'

/**
 * Local (browser) autosave for the in-progress, not-yet-saved invoice. Lets a user close
 * or reload `/invoice/new` and continue where they left off. Cleared once the invoice is
 * persisted to the server (which is the durable store). SSR-safe (no-ops without window).
 */
const KEY = 'billmaker:invoice-draft'

export function writeDraft(invoice: InvoiceData): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ savedAt: Date.now(), invoice }))
  } catch {
    // storage full / disabled — non-fatal
  }
}

export function readDraft(): InvoiceData | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { invoice?: InvoiceData }
    return parsed?.invoice ?? null
  } catch {
    return null
  }
}

export function clearDraft(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(KEY)
  } catch {
    // non-fatal
  }
}
