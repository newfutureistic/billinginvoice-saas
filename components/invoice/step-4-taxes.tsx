'use client'

import { InvoiceData, TaxConfig } from '@/lib/invoice-types'
import { Checkbox, FormField, Input, NumberInput, Select } from './form-inputs'
import { taxLines } from '@/lib/invoice-format'
import { formatMoney } from '@/lib/currency-format'

const TAX_TYPES: Array<{ value: string; label: string }> = [
  { value: 'GST', label: 'GST (Goods & Services Tax)' },
  { value: 'VAT', label: 'VAT (Value Added Tax)' },
  { value: 'Sales Tax', label: 'Sales Tax' },
  { value: 'Custom', label: 'Custom Tax' },
]

export function Step4Taxes({
  tax,
  subtotal,
  discount,
  shipping,
  currency,
  onChange,
}: {
  tax: TaxConfig
  subtotal: number
  discount: InvoiceData['discount']
  shipping: InvoiceData['shipping']
  currency: string
  onChange: (tax: Partial<TaxConfig>) => void
}) {
  const afterDiscount = discount.applied
    ? discount.type === 'percentage'
      ? subtotal * (1 - discount.value / 100)
      : subtotal - discount.value
    : subtotal

  const shippingCost = shipping.applied ? shipping.cost : 0
  const subtotalBeforeTax = afterDiscount + shippingCost

  let taxAmount = 0
  if (tax.basis === 'exclusive') {
    taxAmount = (subtotalBeforeTax * tax.rate) / 100
  } else {
    taxAmount = (subtotalBeforeTax * tax.rate) / (100 + tax.rate)
  }

  const total = tax.basis === 'exclusive' ? subtotalBeforeTax + taxAmount : subtotalBeforeTax

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Taxes</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Configure the tax that applies to this invoice.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Tax Type">
          <Select
            value={tax.type}
            onChange={(e) => onChange({ type: e.target.value as TaxConfig['type'] })}
            options={TAX_TYPES}
          />
        </FormField>

        <FormField label={`Tax Rate (%)`}>
          <NumberInput
            value={tax.rate}
            onChange={(e) => onChange({ rate: Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)) })}
            min="0"
            max="100"
            step="0.01"
          />
        </FormField>

        {tax.type === 'Custom' && (
          <FormField label="Custom Tax Label">
            <Input
              value={tax.customLabel || ''}
              onChange={(e) => onChange({ customLabel: e.target.value })}
              placeholder="e.g., Environmental Tax"
            />
          </FormField>
        )}
      </div>

      {tax.type === 'GST' && (
        <div className="space-y-3 p-4 rounded-lg bg-secondary/30">
          <p className="text-sm font-medium text-foreground">Place of supply</p>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="gstSupply"
              checked={tax.supplyType !== 'inter'}
              onChange={() => onChange({ supplyType: 'intra' })}
              className="w-4 h-4 border border-border rounded-full"
            />
            <span className="text-sm text-foreground">
              Intra-state — <span className="font-medium">CGST + SGST</span> (same state)
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="gstSupply"
              checked={tax.supplyType === 'inter'}
              onChange={() => onChange({ supplyType: 'inter' })}
              className="w-4 h-4 border border-border rounded-full"
            />
            <span className="text-sm text-foreground">
              Inter-state — <span className="font-medium">IGST</span> (different state)
            </span>
          </label>
        </div>
      )}

      <div className="space-y-3 p-4 rounded-lg bg-secondary/30">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="taxBasis"
              value="exclusive"
              checked={tax.basis === 'exclusive'}
              onChange={(e) => onChange({ basis: e.target.value as 'exclusive' | 'inclusive' })}
              className="w-4 h-4 border border-border rounded-full"
            />
            <span className="text-sm font-medium text-foreground">Tax Exclusive (added to subtotal)</span>
          </label>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="taxBasis"
              value="inclusive"
              checked={tax.basis === 'inclusive'}
              onChange={(e) => onChange({ basis: e.target.value as 'exclusive' | 'inclusive' })}
              className="w-4 h-4 border border-border rounded-full"
            />
            <span className="text-sm font-medium text-foreground">Tax Inclusive (included in subtotal)</span>
          </label>
        </div>

        <p className="text-xs text-muted-foreground mt-3">
          {tax.basis === 'exclusive'
            ? 'Tax will be calculated on top of the subtotal'
            : 'Tax is already included in the subtotal'}
        </p>
      </div>

      <div className="space-y-2 p-4 rounded-lg border border-border bg-card">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="text-foreground font-medium">{formatMoney(currency, subtotal)}</span>
        </div>

        {discount.applied && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Discount</span>
            <span className="text-foreground font-medium">
              -
              {formatMoney(
                currency,
                discount.type === 'percentage' ? subtotal * (discount.value / 100) : discount.value,
              )}
            </span>
          </div>
        )}

        {shipping.applied && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span className="text-foreground font-medium">+ {formatMoney(currency, shipping.cost)}</span>
          </div>
        )}

        {taxLines(tax, taxAmount).map((line) => (
          <div key={line.label} className="flex justify-between text-sm border-t border-border pt-2">
            <span className="text-muted-foreground">{line.label}</span>
            <span className="text-foreground font-medium">{formatMoney(currency, line.amount)}</span>
          </div>
        ))}

        <div className="flex justify-between text-base border-t border-border pt-2">
          <span className="font-semibold text-foreground">Total</span>
          <span className="font-bold text-brand text-lg">{formatMoney(currency, total)}</span>
        </div>
      </div>
    </div>
  )
}
