import type { Currency } from '@prisma/client'

/**
 * Currency utilities for the 7 currencies the frozen UI supports
 * (`lib/invoice-types.ts`: USD, EUR, GBP, CAD, AUD, INR, JPY).
 */

export interface CurrencyMeta {
  code: Currency
  symbol: string
  /** Minor-unit digits (JPY has 0). */
  decimals: number
  locale: string
}

export const CURRENCIES: Record<Currency, CurrencyMeta> = {
  USD: { code: 'USD', symbol: '$', decimals: 2, locale: 'en-US' },
  EUR: { code: 'EUR', symbol: '€', decimals: 2, locale: 'en-IE' },
  GBP: { code: 'GBP', symbol: '£', decimals: 2, locale: 'en-GB' },
  CAD: { code: 'CAD', symbol: 'CA$', decimals: 2, locale: 'en-CA' },
  AUD: { code: 'AUD', symbol: 'A$', decimals: 2, locale: 'en-AU' },
  INR: { code: 'INR', symbol: '₹', decimals: 2, locale: 'en-IN' },
  JPY: { code: 'JPY', symbol: '¥', decimals: 0, locale: 'ja-JP' },
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
