'use client'

import { accessConfig } from '@/lib/config/plans'

/**
 * Guest (no account) invoice usage — Phase 1. Guests have no server identity, so their soft
 * limit is tracked client-side. Only a *successful* download increments the count; validation
 * failures and drafts never call this. The count is not decremented, so "deleting" (leaving)
 * an invoice never restores the allowance. Once the limit is reached, invoice #(limit+1)
 * requires a free sign-in. The authoritative per-account limit is enforced server-side.
 */
const KEY = 'billmaker:guest-invoice-count'

export const guestInvoiceLimit = accessConfig.guestInvoiceLimit

export function getGuestInvoiceCount(): number {
  if (typeof window === 'undefined') return 0
  const n = Number(window.localStorage.getItem(KEY))
  return Number.isFinite(n) && n > 0 ? n : 0
}

export function incrementGuestInvoiceCount(): number {
  const next = getGuestInvoiceCount() + 1
  try {
    window.localStorage.setItem(KEY, String(next))
  } catch {
    /* storage unavailable — soft limit simply won't persist */
  }
  return next
}

/** True when a guest has used up their free allowance and must sign in to continue. */
export function guestLimitReached(): boolean {
  return getGuestInvoiceCount() >= guestInvoiceLimit
}
