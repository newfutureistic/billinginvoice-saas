import type { Currency } from '@prisma/client'

/**
 * Currency utilities for the 7 currencies the frozen UI supports
 * (`lib/invoice-types.ts`: USD, EUR, GBP, CAD, AUD, INR, JPY).
 */

export interface CurrencyMeta {
  code: Currency
  /** Symbol for on-screen/HTML use (full Unicode is fine in the browser). */
  symbol: string
  /**
   * Symbol safe for the PDF engine. pdf-lib's standard fonts use WinAnsi (CP1252), which can
   * encode $ £ € ¥ ¢ but NOT ₹ (U+20B9) or the Arabic dirham/riyal glyphs. Those fall back to
   * an unambiguous ASCII token so the PDF never renders a blank or a crash. Changing this to a
   * true glyph would require embedding a Unicode font.
   */
  pdfSymbol: string
  /** Minor-unit digits (JPY has 0). */
  decimals: number
  locale: string
}

export const CURRENCIES: Record<Currency, CurrencyMeta> = {
  USD: { code: 'USD', symbol: '$', pdfSymbol: '$', decimals: 2, locale: 'en-US' },
  EUR: { code: 'EUR', symbol: '€', pdfSymbol: '€', decimals: 2, locale: 'en-IE' },
  GBP: { code: 'GBP', symbol: '£', pdfSymbol: '£', decimals: 2, locale: 'en-GB' },
  CAD: { code: 'CAD', symbol: 'CA$', pdfSymbol: 'CA$', decimals: 2, locale: 'en-CA' },
  AUD: { code: 'AUD', symbol: 'A$', pdfSymbol: 'A$', decimals: 2, locale: 'en-AU' },
  // ₹ is not WinAnsi-encodable — "Rs." is the standard ASCII rendering used on Indian invoices.
  INR: { code: 'INR', symbol: '₹', pdfSymbol: 'Rs.', decimals: 2, locale: 'en-IN' },
  JPY: { code: 'JPY', symbol: '¥', pdfSymbol: '¥', decimals: 0, locale: 'ja-JP' },
  AED: { code: 'AED', symbol: 'AED', pdfSymbol: 'AED', decimals: 2, locale: 'en-AE' },
  SGD: { code: 'SGD', symbol: 'S$', pdfSymbol: 'S$', decimals: 2, locale: 'en-SG' },
  CHF: { code: 'CHF', symbol: 'CHF', pdfSymbol: 'CHF', decimals: 2, locale: 'de-CH' },
  NZD: { code: 'NZD', symbol: 'NZ$', pdfSymbol: 'NZ$', decimals: 2, locale: 'en-NZ' },
  // ﷼ (U+FDFC) is not WinAnsi-encodable — the ISO code is the standard ASCII rendering.
  SAR: { code: 'SAR', symbol: '﷼', pdfSymbol: 'SAR', decimals: 2, locale: 'en-SA' },
  QAR: { code: 'QAR', symbol: '﷼', pdfSymbol: 'QAR', decimals: 2, locale: 'en-QA' },
}

/** Symbol guaranteed to render in the PDF engine. */
export function pdfCurrencySymbol(code: Currency): string {
  return CURRENCIES[code]?.pdfSymbol ?? code
}

export function currencyMeta(code: Currency): CurrencyMeta {
  return CURRENCIES[code]
}

export function currencySymbol(code: Currency): string {
  return CURRENCIES[code].symbol
}

/** Locale-aware currency formatting (presentation only). */
export function formatCurrency(amount: number, code: Currency): string {
  const meta = CURRENCIES[code]
  return new Intl.NumberFormat(meta.locale, {
    style: 'currency',
    currency: code,
    minimumFractionDigits: meta.decimals,
    maximumFractionDigits: meta.decimals,
  }).format(amount)
}

/** Round a monetary amount to the currency's minor unit. */
export function roundMoney(amount: number, code: Currency): number {
  const factor = 10 ** CURRENCIES[code].decimals
  return Math.round((amount + Number.EPSILON) * factor) / factor
}
