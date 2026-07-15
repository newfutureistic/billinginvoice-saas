'use client'

import { InvoiceData } from '@/lib/invoice-types'
import { Checkbox, FormField, Input, NumberInput, Select, Textarea } from './form-inputs'
import { QrImage } from './qr-image'
import { QrCode } from 'lucide-react'
import { resolveInvoiceQr, qrCaption } from '@/lib/invoice-format'

type PaymentUpdate = Partial<
  Pick<InvoiceData, 'upiId' | 'upiPayeeName' | 'upiIncludeAmount' | 'qrCode'>
>

type MetaUpdate = Partial<
  Pick<
    InvoiceData,
    | 'documentTitle'
    | 'invoiceNumber'
    | 'invoicePrefix'
    | 'poNumber'
    | 'referenceNumber'
    | 'paymentMethod'
    | 'paymentStatus'
    | 'additionalCharges'
    | 'roundOff'
  >
>

export function Step6Shipping({
  shipping,
  additionalCharges,
  roundOff,
  currency,
  onChange,
  onUpdateMeta,
}: {
  shipping: InvoiceData['shipping']
  additionalCharges?: InvoiceData['additionalCharges']
  roundOff?: boolean
  currency: string
  onChange: (shipping: Partial<InvoiceData['shipping']>) => void
  onUpdateMeta: (meta: MetaUpdate) => void
}) {
  const ac = additionalCharges ?? { label: 'Additional charge', amount: 0, applied: false }
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Shipping &amp; Charges</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Add shipping, extra charges, and rounding.
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
            onChange={(e) => onChange({ cost: Math.max(0, parseFloat(e.target.value) || 0) })}
            min="0"
            step="0.01"
            placeholder="0.00"
          />
        </FormField>
      )}

      <label className="flex items-center gap-3 cursor-pointer p-4 rounded-lg border-2 border-border hover:border-brand hover:bg-brand/5 transition-colors">
        <input
          type="checkbox"
          checked={ac.applied}
          onChange={(e) => onUpdateMeta({ additionalCharges: { ...ac, applied: e.target.checked } })}
          className="w-4 h-4 rounded border border-border bg-background text-brand"
        />
        <span className="font-medium text-foreground">Apply additional charge</span>
      </label>

      {ac.applied && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Charge Label">
            <Input
              value={ac.label}
              onChange={(e) => onUpdateMeta({ additionalCharges: { ...ac, label: e.target.value } })}
              placeholder="e.g., Packaging, Handling"
            />
          </FormField>
          <FormField label={`Amount (${currency})`}>
            <NumberInput
              value={ac.amount}
              onChange={(e) => onUpdateMeta({ additionalCharges: { ...ac, amount: Math.max(0, parseFloat(e.target.value) || 0) } })}
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </FormField>
        </div>
      )}

      <label className="flex items-center gap-3 cursor-pointer p-4 rounded-lg border-2 border-border hover:border-brand hover:bg-brand/5 transition-colors">
        <input
          type="checkbox"
          checked={roundOff ?? false}
          onChange={(e) => onUpdateMeta({ roundOff: e.target.checked })}
          className="w-4 h-4 rounded border border-border bg-background text-brand"
        />
        <span className="font-medium text-foreground">Round off total to nearest whole number</span>
      </label>
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
  qrCode,
  upiId,
  upiPayeeName,
  upiIncludeAmount,
  businessName,
  documentTitle,
  invoiceNumber,
  invoicePrefix,
  poNumber,
  referenceNumber,
  paymentMethod,
  paymentStatus,
  total,
  currency,
  onUpdateTerms,
  onUpdatePaymentInstructions,
  onUpdatePayment,
  onUpdateBankDetails,
  onUpdateMeta,
}: {
  terms: string
  paymentInstructions: string
  bankDetails: InvoiceData['bankDetails']
  qrCode?: string
  upiId?: string
  upiPayeeName?: string
  upiIncludeAmount?: boolean
  businessName: string
  documentTitle?: string
  invoiceNumber: string
  invoicePrefix?: string
  poNumber?: string
  referenceNumber?: string
  paymentMethod?: InvoiceData['paymentMethod']
  paymentStatus?: InvoiceData['paymentStatus']
  total: number
  currency: string
  onUpdateTerms: (terms: string) => void
  onUpdatePaymentInstructions: (instructions: string) => void
  onUpdatePayment: (payment: PaymentUpdate) => void
  onUpdateBankDetails: (details: Partial<InvoiceData['bankDetails']>) => void
  onUpdateMeta: (meta: MetaUpdate) => void
}) {
  const qrValue = resolveInvoiceQr({
    upiId,
    payeeName: upiPayeeName || businessName,
    includeAmount: upiIncludeAmount,
    amount: total,
    invoiceNumber,
    fallback: qrCode,
  })
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Terms & Payment</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Add invoice references, payment terms and bank details.
        </p>
      </div>

      <FormField label="Document Title">
        <Input
          value={documentTitle ?? ''}
          onChange={(e) => onUpdateMeta({ documentTitle: e.target.value })}
          placeholder="Invoice"
          maxLength={40}
          list="document-title-presets"
          aria-describedby="document-title-hint"
        />
        <p id="document-title-hint" className="text-xs text-muted-foreground">
          The heading printed on the PDF and preview. Leave blank to use “Invoice”.
        </p>
        <datalist id="document-title-presets">
          {[
            'Invoice',
            'Tax Invoice',
            'Proforma Invoice',
            'Commercial Invoice',
            'Service Invoice',
            'Quotation',
            'Estimate',
            'Purchase Order',
            'Sales Order',
            'Receipt',
            'Packing List',
            'Credit Note',
            'Debit Note',
          ].map((t) => (
            <option key={t} value={t} />
          ))}
        </datalist>
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Invoice Prefix">
          <Input
            value={invoicePrefix ?? ''}
            onChange={(e) => onUpdateMeta({ invoicePrefix: e.target.value })}
            placeholder="INV"
          />
        </FormField>
        <FormField label="Invoice Number">
          <Input
            value={invoiceNumber}
            onChange={(e) => onUpdateMeta({ invoiceNumber: e.target.value })}
            placeholder="INV-2024-001"
          />
        </FormField>
        <FormField label="Purchase Order (PO) Number">
          <Input
            value={poNumber ?? ''}
            onChange={(e) => onUpdateMeta({ poNumber: e.target.value })}
            placeholder="PO-88231"
          />
        </FormField>
        <FormField label="Reference Number">
          <Input
            value={referenceNumber ?? ''}
            onChange={(e) => onUpdateMeta({ referenceNumber: e.target.value })}
            placeholder="REF-2024-77"
          />
        </FormField>
        <FormField label="Payment Method">
          <Select
            value={paymentMethod ?? 'bank'}
            onChange={(e) => onUpdateMeta({ paymentMethod: e.target.value as InvoiceData['paymentMethod'] })}
            options={[
              { value: 'bank', label: 'Bank Transfer' },
              { value: 'upi', label: 'UPI' },
              { value: 'cash', label: 'Cash' },
              { value: 'cheque', label: 'Cheque' },
              { value: 'card', label: 'Card' },
              { value: 'other', label: 'Other' },
            ]}
          />
        </FormField>
        <FormField label="Payment Status">
          <Select
            value={paymentStatus ?? 'unpaid'}
            onChange={(e) => onUpdateMeta({ paymentStatus: e.target.value as InvoiceData['paymentStatus'] })}
            options={[
              { value: 'unpaid', label: 'Unpaid' },
              { value: 'partial', label: 'Partially Paid' },
              { value: 'paid', label: 'Paid' },
            ]}
          />
        </FormField>
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
        <p className="text-xs text-muted-foreground">These details will appear on your invoice.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField label="Account Holder">
            <Input value={bankDetails.accountName} onChange={(e) => onUpdateBankDetails({ accountName: e.target.value })} placeholder="Bill Maker Inc." />
          </FormField>
          <FormField label="Account Number">
            <Input value={bankDetails.accountNumber} onChange={(e) => onUpdateBankDetails({ accountNumber: e.target.value })} placeholder="9876543210" />
          </FormField>
          <FormField label="Bank Name">
            <Input value={bankDetails.bankName} onChange={(e) => onUpdateBankDetails({ bankName: e.target.value })} placeholder="HDFC Bank" />
          </FormField>
          <FormField label="Branch">
            <Input value={bankDetails.branch ?? ''} onChange={(e) => onUpdateBankDetails({ branch: e.target.value })} placeholder="MG Road" />
          </FormField>
          <FormField label="IFSC">
            <Input value={bankDetails.ifsc ?? ''} onChange={(e) => onUpdateBankDetails({ ifsc: e.target.value })} placeholder="HDFC0001234" />
          </FormField>
          <FormField label="Routing Number">
            <Input value={bankDetails.routingNumber} onChange={(e) => onUpdateBankDetails({ routingNumber: e.target.value })} placeholder="123456789" />
          </FormField>
          <FormField label="SWIFT / BIC">
            <Input value={bankDetails.swift ?? ''} onChange={(e) => onUpdateBankDetails({ swift: e.target.value })} placeholder="HDFCINBB" />
          </FormField>
          <FormField label="IBAN">
            <Input value={bankDetails.iban ?? ''} onChange={(e) => onUpdateBankDetails({ iban: e.target.value })} placeholder="GB33BUKB20201555555555" />
          </FormField>
        </div>
      </div>

      <div className="space-y-4 p-4 rounded-lg border border-border bg-card">
        <div>
          <h4 className="font-medium text-foreground">Payment QR (UPI)</h4>
          <p className="text-xs text-muted-foreground">
            Add your UPI ID to put a scannable pay QR on the invoice &amp; PDF. Scanning it opens
            GPay/PhonePe/Paytm{upiIncludeAmount ? ' with the amount pre-filled' : ''}.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex-1 space-y-3">
            <FormField label="UPI ID">
              <Input
                value={upiId ?? ''}
                onChange={(e) => onUpdatePayment({ upiId: e.target.value })}
                placeholder="yourname@okhdfcbank"
              />
            </FormField>

            <FormField label="Payee Name">
              <Input
                value={upiPayeeName ?? ''}
                onChange={(e) => onUpdatePayment({ upiPayeeName: e.target.value })}
                placeholder={businessName || 'Name shown in payer app'}
              />
            </FormField>

            <Checkbox
              label={`Include invoice amount (${currency} ${total.toFixed(2)}) in the QR`}
              checked={upiIncludeAmount ?? false}
              onChange={(e) => onUpdatePayment({ upiIncludeAmount: e.target.checked })}
            />

            <FormField label="Or a payment / view-invoice link (used only if no UPI ID)">
              <Input
                value={qrCode ?? ''}
                onChange={(e) => onUpdatePayment({ qrCode: e.target.value })}
                placeholder="https://pay.example.com/INV-2024-001"
              />
            </FormField>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-lg border border-border bg-white p-2">
              <QrImage
                value={qrValue}
                size={112}
                onEmpty={
                  <span className="flex flex-col items-center gap-1 text-center text-[11px] text-muted-foreground">
                    <QrCode className="h-6 w-6 opacity-50" />
                    QR preview
                  </span>
                }
              />
            </div>
            {qrValue && (
              <span className="text-[11px] font-medium text-muted-foreground">{qrCaption(qrValue)}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
