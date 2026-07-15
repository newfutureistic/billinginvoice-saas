/**
 * Client-safe currency formatting for the invoice builder + preview. Mirrors the symbol/decimal
 * data in `server/utils/currency.ts` without importing server code, so changing the currency in
 * the builder immediately shows the right symbol (₹, $, €, £, ¥ …) and decimal places.
 */
export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'CA$',
  AUD: 'A$',
  INR: '₹',
  JPY: '¥',
  AED: 'AED',
  SGD: 'S$',
  CHF: 'CHF',
  NZD: 'NZ$',
  SAR: '﷼',
  QAR: '﷼',
}

const ZERO_DECIMAL = new Set(['JPY'])

export function currencySymbol(code: string): string {
  return CURRENCY_SYMBOLS[code] ?? code
}

/** Format an amount with the currency's symbol + decimals (e.g. `INR 1500` → `₹1,500.00`). */
export function formatMoney(code: string, amount: number): string {
  const sym = currencySymbol(code)
  const decimals = ZERO_DECIMAL.has(code) ? 0 : 2
  const n = amount.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  // Single/short glyph symbols hug the number ($1,000, ₹1,000, A$1,000); word-like codes get a space (AED 1,000).
  return sym.length <= 2 ? `${sym}${n}` : `${sym} ${n}`
}
