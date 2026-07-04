import { roundTo } from '@/server/utils/decimal'

/**
 * Tax calculation utility (GST / VAT / Sales Tax), inclusive or exclusive of the base
 * amount. This is a pure calculator — it faithfully mirrors the tax rules in the frozen
 * `calculateInvoiceTotals` (`lib/invoice-state.ts`) so the future invoice engine can
 * reuse it. It is NOT the invoice engine and touches no persistence.
 */

export type TaxBasis = 'inclusive' | 'exclusive'

export interface TaxResult {
  /** Amount excluding tax. */
  net: number
  /** Tax amount. */
  tax: number
  /** Amount including tax. */
  gross: number
  rate: number
  basis: TaxBasis
}

/**
 * @param amount base amount. For `exclusive` this is the net; for `inclusive` this is
 *               the gross (tax is extracted from within it).
 * @param rate   tax percentage (e.g. 10 for 10%).
 */
export function calculateTax(amount: number, rate: number, basis: TaxBasis): TaxResult {
  if (rate < 0) throw new Error('Tax rate cannot be negative')

  if (basis === 'inclusive') {
    const net = rate === 0 ? amount : (amount * 100) / (100 + rate)
    const tax = amount - net
    return { net: roundTo(net), tax: roundTo(tax), gross: roundTo(amount), rate, basis }
  }

  const tax = (amount * rate) / 100
  return { net: roundTo(amount), tax: roundTo(tax), gross: roundTo(amount + tax), rate, basis }
}

/** Just the tax portion for an exclusive base amount. */
export function taxAmount(net: number, rate: number): number {
  return roundTo((net * rate) / 100)
}
