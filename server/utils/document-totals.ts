import { calculateTax } from '@/server/utils/tax'
import { roundTo } from '@/server/utils/decimal'

/**
 * Document totals engine (pure). Shared by every document type — invoice, quote,
 * estimate, receipt, PO, credit note, salary slip — so the money math lives in exactly
 * one place (Mission 5 §5, "never duplicate logic"). Mirrors the frozen
 * `calculateInvoiceTotals` rules: subtotal → discount → tax (inclusive/exclusive) →
 * shipping. Reuses the existing `calculateTax` utility.
 */
export interface TotalsItemInput {
  quantity: number
  rate: number
}

export interface TotalsTaxInput {
  rate: number
  basis: 'inclusive' | 'exclusive'
}

export interface TotalsDiscountInput {
  type: 'percentage' | 'fixed'
  value: number
  applied: boolean
}

export interface TotalsShippingInput {
  cost: number
  applied: boolean
}

export interface DocumentTotals {
  subtotal: number
  discountAmount: number
  taxableBase: number
  taxTotal: number
  shippingAmount: number
  total: number
}

export function computeDocumentTotals(
  items: TotalsItemInput[],
  tax: TotalsTaxInput,
  discount?: TotalsDiscountInput,
  shipping?: TotalsShippingInput,
): DocumentTotals {
  const subtotal = roundTo(items.reduce((sum, it) => sum + it.quantity * it.rate, 0))

  let discountAmount = 0
  if (discount?.applied) {
    discountAmount =
      discount.type === 'percentage'
        ? roundTo((subtotal * discount.value) / 100)
        : Math.min(discount.value, subtotal)
  }

  const taxableBase = roundTo(subtotal - discountAmount)
  const taxResult = calculateTax(taxableBase, tax.rate, tax.basis)
  const taxTotal = taxResult.tax
  const shippingAmount = shipping?.applied ? roundTo(shipping.cost) : 0

  // Exclusive: tax is added on top; inclusive: tax already lives inside the base.
  const total =
    tax.basis === 'exclusive'
      ? roundTo(taxableBase + taxTotal + shippingAmount)
      : roundTo(taxableBase + shippingAmount)

  return { subtotal, discountAmount, taxableBase, taxTotal, shippingAmount, total }
}
