'use client'

import { InvoiceData } from '@/lib/invoice-types'
import { Checkbox, FormField, Input, NumberInput, Textarea } from './form-inputs'

export function Step6Shipping({
  shipping,
  currency,
  onChange,
}: {
  shipping: InvoiceData['shipping']
  currency: string
  onChange: (shipping: Partial<InvoiceData['shipping']>) => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Shipping</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Add shipping costs if this invoice includes delivery.
        </p>
      </div>

      <label className="flex items-center gap-3 cursor-pointer p-4 rounded-lg border-2 border-border hover:border-brand hover:bg-brand/5 transition-colors">
        <input
          type="checkbox"
          checked={shipping.applied}
          onChange={(e) => onChange({ applied: e.target.checked })}
          className="w-4 h-4 rounded border border-border bg-background text-brand"
        />
        <span className="font-medium text-foreground">Apply shipping cost</span>
      </label>

      {shipping.applied && (
        <FormField label={`Shipping Cost (${currency})`}>
          <NumberInput
            value={shipping.cost}
            onChange={(e) => onChange({ cost: parseFloat(e.target.value) || 0 })}
            min="0"
            step="0.01"
            placeholder="0.00"
          />
        </FormField>
      )}
    </div>
  )
}

export function Step7Notes({
  notes,
  onChange,
}: {
  notes: string
  onChange: (notes: string) => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Notes</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Add a personal message or thank you note to your client.
        </p>
      </div>

      <FormField label="Invoice Notes">
        <Textarea
          value={notes}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Thank you for your business..."
          rows={5}
        />
      </FormField>

      <p className="text-xs text-muted-foreground">
        These notes will appear at the bottom of your invoice.
      </p>
    </div>
  )
}

export function Step8Terms({
  terms,
  paymentInstructions,
  bankDetails,
  onUpdateTerms,
  onUpdatePaymentInstructions,
}: {
  terms: string
  paymentInstructions: string
  bankDetails: InvoiceData['bankDetails']
  onUpdateTerms: (terms: string) => void
  onUpdatePaymentInstructions: (instructions: string) => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Terms & Payment</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Add payment terms and bank details.
        </p>
      </div>

      <FormField label="Payment Terms">
        <Textarea
          value={terms}
          onChange={(e) => onUpdateTerms(e.target.value)}
          placeholder="Payment is due within 30 days of the invoice date..."
          rows={4}
        />
      </FormField>

      <FormField label="Payment Instructions">
        <Textarea
          value={paymentInstructions}
          onChange={(e) => onUpdatePaymentInstructions(e.target.value)}
          placeholder="Please transfer funds to the bank account below..."
          rows={3}
        />
      </FormField>

      <div className="p-4 rounded-lg bg-secondary/30 space-y-3">
        <h4 className="font-medium text-foreground">Bank Account Information</h4>
        <p className="text-xs text-muted-foreground">
          These details will appear on your invoice.
        </p>
        <div className="text-sm space-y-1 text-muted-foreground">
          <p>Account: {bankDetails.accountName}</p>
          <p>Number: {bankDetails.accountNumber}</p>
          <p>Routing: {bankDetails.routingNumber}</p>
          <p>Bank: {bankDetails.bankName}</p>
        </div>
      </div>
    </div>
  )
}
