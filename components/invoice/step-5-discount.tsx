'use client'

import { InvoiceData } from '@/lib/invoice-types'
import { Checkbox, FormField, NumberInput } from './form-inputs'

export function Step5Discount({
  discount,
  subtotal,
  currency,
  onChange,
}: {
  discount: InvoiceData['discount']
  subtotal: number
  currency: string
  onChange: (discount: Partial<InvoiceData['discount']>) => void
}) {
  const discountAmount =
    discount.type === 'percentage'
      ? (subtotal * discount.value) / 100
      : discount.value

  const afterDiscount = subtotal - discountAmount

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Discount</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Offer a discount to your client, either as a percentage or fixed amount.
        </p>
      </div>

      <div className="space-y-4">
        <label className="flex items-center gap-3 cursor-pointer p-4 rounded-lg border-2 border-border hover:border-brand hover:bg-brand/5 transition-colors">
          <input
            type="checkbox"
            checked={discount.applied}
            onChange={(e) => onChange({ applied: e.target.checked })}
            className="w-4 h-4 rounded border border-border bg-background text-brand focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
          />
          <span className="font-medium text-foreground">Apply a discount to this invoice</span>
        </label>

        {discount.applied && (
          <div className="space-y-4 p-4 rounded-lg bg-secondary/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 cursor-pointer mb-3">
                  <input
                    type="radio"
                    name="discountType"
                    value="percentage"
                    checked={discount.type === 'percentage'}
                    onChange={(e) => onChange({ type: 'percentage' })}
                    className="w-4 h-4 border border-border rounded-full"
                  />
                  <span className="text-sm font-medium text-foreground">Percentage</span>
                </label>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer mb-3">
                  <input
                    type="radio"
                    name="discountType"
                    value="fixed"
                    checked={discount.type === 'fixed'}
                    onChange={(e) => onChange({ type: 'fixed' })}
                    className="w-4 h-4 border border-border rounded-full"
                  />
                  <span className="text-sm font-medium text-foreground">Fixed Amount</span>
                </label>
              </div>
            </div>

            <FormField
              label={discount.type === 'percentage' ? 'Discount %' : `Discount Amount (${currency})`}
            >
              <NumberInput
                value={discount.value}
                onChange={(e) => onChange({ value: parseFloat(e.target.value) || 0 })}
                min="0"
                step={discount.type === 'percentage' ? '0.1' : '0.01'}
                max={discount.type === 'percentage' ? '100' : undefined}
              />
            </FormField>
          </div>
        )}
      </div>

      <div className="space-y-2 p-4 rounded-lg border border-border bg-card">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="text-foreground font-medium">{currency} {subtotal.toFixed(2)}</span>
        </div>

        {discount.applied && (
          <>
            <div className="flex justify-between text-sm text-destructive">
              <span>Discount ({discount.type === 'percentage' ? `${discount.value}%` : 'Fixed'})</span>
              <span className="font-medium">- {currency} {discountAmount.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-base border-t border-border pt-2">
              <span className="font-semibold text-foreground">After Discount</span>
              <span className="font-bold text-brand">{currency} {afterDiscount.toFixed(2)}</span>
            </div>

            <p className="text-xs text-muted-foreground mt-2">
              You&apos;re saving your customer {currency} {discountAmount.toFixed(2)}
            </p>
          </>
        )}
      </div>

      {!discount.applied && (
        <p className="text-sm text-muted-foreground p-4 rounded-lg bg-secondary/30">
          No discount applied. Enable a discount above to offer one to your client.
        </p>
      )}
    </div>
  )
}
