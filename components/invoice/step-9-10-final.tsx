'use client'

import { InvoiceData } from '@/lib/invoice-types'
import { Checkbox, FormField, Input } from './form-inputs'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

export function Step9Branding({
  brandColor,
  brandingSection,
  onUpdateBranding,
}: {
  brandColor: string
  brandingSection: InvoiceData['brandingSection']
  onUpdateBranding: (branding: Partial<Pick<InvoiceData, 'brandColor' | 'brandingSection'>>) => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Branding</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Customize the look and feel of your invoice.
        </p>
      </div>

      <FormField label="Brand Color">
        <div className="flex gap-3">
          <input
            type="color"
            value={brandColor}
            onChange={(e) => onUpdateBranding({ brandColor: e.target.value })}
            className="h-12 w-20 rounded cursor-pointer border border-border"
          />
          <Input
            value={brandColor}
            onChange={(e) => onUpdateBranding({ brandColor: e.target.value })}
            placeholder="#3b82f6"
            className="flex-1"
          />
        </div>
      </FormField>

      <div className="space-y-3 p-4 rounded-lg bg-secondary/30">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={brandingSection.showBrandColor}
            onChange={(e) =>
              onUpdateBranding({
                brandingSection: {
                  ...brandingSection,
                  showBrandColor: e.target.checked,
                },
              })
            }
            className="w-4 h-4 rounded border border-border bg-background text-brand"
          />
          <span className="text-sm font-medium text-foreground">
            Use brand color in invoice header
          </span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={brandingSection.showLogo}
            onChange={(e) =>
              onUpdateBranding({
                brandingSection: {
                  ...brandingSection,
                  showLogo: e.target.checked,
                },
              })
            }
            className="w-4 h-4 rounded border border-border bg-background text-brand"
          />
          <span className="text-sm font-medium text-foreground">
            Show logo on invoice
          </span>
        </label>
      </div>

      <div className="p-4 rounded-lg border-2 border-dashed border-border">
        <p className="text-sm text-muted-foreground mb-3">Logo Upload</p>
        <div className="flex items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-lg bg-card hover:bg-secondary/30 transition-colors cursor-pointer">
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">Drop your logo here</p>
            <p className="text-xs text-muted-foreground">or click to browse</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Step10Preview({
  invoice,
  validationErrors,
}: {
  invoice: InvoiceData
  validationErrors: string[]
}) {
  const isValid = validationErrors.length === 0

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Review & Export</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Check your invoice details before exporting.
        </p>
      </div>

      {!isValid && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex gap-3">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-destructive mb-2">Please fix these issues:</h4>
            <ul className="space-y-1 text-sm text-destructive">
              {validationErrors.map((error, i) => (
                <li key={i}>• {error}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {isValid && (
        <div className="p-4 rounded-lg bg-success-muted border border-success/20 flex gap-3">
          <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-foreground">Invoice is ready</h4>
            <p className="text-sm text-muted-foreground">
              All required fields are complete. You can now download or share your invoice.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg border border-border bg-card">
          <h4 className="font-medium text-foreground mb-3">Invoice Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Invoice #</span>
              <span className="font-medium">{invoice.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">From</span>
              <span className="font-medium">{invoice.business.businessName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">To</span>
              <span className="font-medium">{invoice.client.clientName}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-border">
              <span className="text-muted-foreground">Total</span>
              <span className="font-bold text-brand">{invoice.currency} {invoice.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg border border-border bg-card">
          <h4 className="font-medium text-foreground mb-3">Items</h4>
          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">{invoice.items.length} item{invoice.items.length !== 1 ? 's' : ''}</p>
            {invoice.items.slice(0, 3).map((item) => (
              <p key={item.id} className="text-xs truncate text-foreground">
                • {item.description}
              </p>
            ))}
            {invoice.items.length > 3 && (
              <p className="text-xs text-muted-foreground">
                + {invoice.items.length - 3} more
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-secondary/30">
        <p className="text-sm text-muted-foreground">
          Use the export buttons below to download as PDF, print, or share with your client.
        </p>
      </div>
    </div>
  )
}
