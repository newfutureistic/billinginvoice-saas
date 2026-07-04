'use client'

import { InvoiceData, PreviewMode } from '@/lib/invoice-types'
import { getTemplate } from '@/lib/invoice-templates'
import { ZoomIn, ZoomOut } from 'lucide-react'
import { useState } from 'react'

export function InvoicePreview({
  invoice,
  mode = 'desktop',
}: {
  invoice: InvoiceData
  mode?: PreviewMode
}) {
  const [zoom, setZoom] = useState(100)
  const template = getTemplate(invoice.template)
  const colors = template?.colors || {
    primary: '#000000',
    accent: '#3b82f6',
    text: '#1f2937',
    background: '#ffffff',
  }

  const getPreviewDimensions = () => {
    switch (mode) {
      case 'mobile':
        return { width: 375, height: 812 }
      case 'tablet':
        return { width: 768, height: 1024 }
      case 'desktop':
      default:
        return { width: 1000, height: 1300 }
    }
  }

  const dims = getPreviewDimensions()
  const scale = zoom / 100

  return (
    <div className="flex flex-col h-full">
      {/* Zoom Controls */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card sticky top-0 z-10">
        <span className="text-sm font-medium text-foreground">{mode.charAt(0).toUpperCase() + mode.slice(1)} Preview</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(Math.max(25, zoom - 10))}
            className="p-2 rounded hover:bg-secondary transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="w-12 text-center text-sm font-medium">{zoom}%</span>
          <button
            onClick={() => setZoom(Math.min(200, zoom + 10))}
            className="p-2 rounded hover:bg-secondary transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Preview Canvas */}
      <div className="flex-1 overflow-auto bg-secondary/30 flex items-center justify-center p-4">
        <div
          style={{
            width: dims.width,
            height: dims.height,
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
            backgroundColor: colors.background,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px',
          }}
        >
          <InvoiceTemplate invoice={invoice} colors={colors} />
        </div>
      </div>
    </div>
  )
}

function InvoiceTemplate({
  invoice,
  colors,
}: {
  invoice: InvoiceData
  colors: { primary: string; accent: string; text: string; background: string }
}) {
  const subtotal = invoice.items.reduce((sum, item) => sum + item.quantity * item.rate, 0)
  const discountAmount =
    invoice.discount.applied && invoice.discount.type === 'percentage'
      ? (subtotal * invoice.discount.value) / 100
      : invoice.discount.applied
        ? invoice.discount.value
        : 0
  const afterDiscount = subtotal - discountAmount
  const shippingCost = invoice.shipping.applied ? invoice.shipping.cost : 0

  return (
    <div className="p-8 h-full flex flex-col" style={{ color: colors.text }}>
      {/* Header */}
      <div
        className="pb-6 mb-6 border-b-2"
        style={{ borderColor: colors.accent }}
      >
        <h1 style={{ color: colors.primary }} className="text-3xl font-bold">
          {invoice.business.businessName}
        </h1>
        <p className="text-sm mt-1">{invoice.business.address}</p>
        <p className="text-sm">{invoice.business.city}, {invoice.business.state}</p>
      </div>

      {/* Invoice Title & Meta */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h2 style={{ color: colors.primary }} className="text-2xl font-bold mb-4">
            INVOICE
          </h2>
          <div className="space-y-1 text-sm">
            <p><strong>Invoice #:</strong> {invoice.invoiceNumber}</p>
            <p><strong>Date:</strong> {new Date(invoice.issueDate).toLocaleDateString()}</p>
            <p><strong>Due Date:</strong> {new Date(invoice.dueDate).toLocaleDateString()}</p>
          </div>
        </div>

        <div>
          <div className="text-right">
            <h3 className="font-bold mb-2">Bill To:</h3>
            <p className="font-semibold">{invoice.client.clientName}</p>
            <p className="text-sm">{invoice.client.address}</p>
            <p className="text-sm">{invoice.client.city}, {invoice.client.state}</p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-8 text-sm border-collapse">
        <thead>
          <tr style={{ backgroundColor: colors.accent }}>
            <th className="text-white text-left p-2">Description</th>
            <th className="text-white text-right p-2 w-20">Qty</th>
            <th className="text-white text-right p-2 w-20">Rate</th>
            <th className="text-white text-right p-2 w-24">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, idx) => (
            <tr key={item.id} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
              <td className="p-2 border-b">{item.description}</td>
              <td className="p-2 text-right border-b">{item.quantity}</td>
              <td className="p-2 text-right border-b">{invoice.currency} {item.rate.toFixed(2)}</td>
              <td className="p-2 text-right border-b">{invoice.currency} {(item.quantity * item.rate).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-64">
          <div className="flex justify-between py-2 border-b">
            <span>Subtotal:</span>
            <span>{invoice.currency} {subtotal.toFixed(2)}</span>
          </div>
          {invoice.discount.applied && (
            <div className="flex justify-between py-2 border-b text-destructive">
              <span>Discount:</span>
              <span>-{invoice.currency} {discountAmount.toFixed(2)}</span>
            </div>
          )}
          {invoice.shipping.applied && (
            <div className="flex justify-between py-2 border-b">
              <span>Shipping:</span>
              <span>+{invoice.currency} {shippingCost.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between py-3 font-bold text-lg" style={{ color: colors.primary }}>
            <span>Total:</span>
            <span>{invoice.currency} {invoice.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto border-t pt-6 text-sm">
        {invoice.notes && (
          <div className="mb-4">
            <strong>Notes:</strong>
            <p>{invoice.notes}</p>
          </div>
        )}
        {invoice.terms && (
          <div>
            <strong>Terms:</strong>
            <p>{invoice.terms}</p>
          </div>
        )}
      </div>
    </div>
  )
}
