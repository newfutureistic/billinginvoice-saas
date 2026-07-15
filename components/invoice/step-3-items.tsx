'use client'

import { InvoiceItem } from '@/lib/invoice-types'
import { Copy, GripVertical, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { FormField, Input, NumberInput, Select } from './form-inputs'
import { formatMoney, currencySymbol } from '@/lib/currency-format'

/** Enterprise currency list (code — symbol/name), matching the DB `Currency` enum. */
export const CURRENCY_OPTIONS = [
  { value: 'INR', label: 'INR — ₹ Indian Rupee' },
  { value: 'USD', label: 'USD — $ US Dollar' },
  { value: 'EUR', label: 'EUR — € Euro' },
  { value: 'GBP', label: 'GBP — £ British Pound' },
  { value: 'AED', label: 'AED — د.إ UAE Dirham' },
  { value: 'AUD', label: 'AUD — A$ Australian Dollar' },
  { value: 'CAD', label: 'CAD — CA$ Canadian Dollar' },
  { value: 'SGD', label: 'SGD — S$ Singapore Dollar' },
  { value: 'CHF', label: 'CHF — Swiss Franc' },
  { value: 'JPY', label: 'JPY — ¥ Japanese Yen' },
  { value: 'NZD', label: 'NZD — NZ$ New Zealand Dollar' },
  { value: 'SAR', label: 'SAR — ﷼ Saudi Riyal' },
  { value: 'QAR', label: 'QAR — ﷼ Qatari Riyal' },
]

export function Step3Items({
  items,
  currency,
  onAddItem,
  onUpdateItem,
  onDuplicateItem,
  onRemoveItem,
  onReorderItems,
  onCurrencyChange,
}: {
  items: InvoiceItem[]
  currency: string
  onAddItem: () => void
  onUpdateItem: (index: number, item: InvoiceItem) => void
  onDuplicateItem: (itemId: string) => void
  onRemoveItem: (itemId: string) => void
  onReorderItems: (items: InvoiceItem[]) => void
  onCurrencyChange: (currency: string) => void
}) {
  const [draggedId, setDraggedId] = useState<string | null>(null)

  const handleDragStart = (id: string) => {
    setDraggedId(id)
  }

  const handleDragOver = (e: React.DragEvent, overId: string) => {
    e.preventDefault()
    if (!draggedId || draggedId === overId) return

    const draggedIndex = items.findIndex((i) => i.id === draggedId)
    const overIndex = items.findIndex((i) => i.id === overId)

    if (draggedIndex < overIndex) {
      const newItems = [
        ...items.slice(0, draggedIndex),
        ...items.slice(draggedIndex + 1, overIndex + 1),
        items[draggedIndex],
        ...items.slice(overIndex + 1),
      ]
      onReorderItems(newItems)
      setDraggedId(overId)
    } else {
      const newItems = [
        ...items.slice(0, overIndex),
        items[draggedIndex],
        ...items.slice(overIndex, draggedIndex),
        ...items.slice(draggedIndex + 1),
      ]
      onReorderItems(newItems)
      setDraggedId(overId)
    }
  }

  const handleDragEnd = () => {
    setDraggedId(null)
  }

  const handleFieldChange = (
    index: number,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    const updated = { ...items[index], [field]: value }
    onUpdateItem(index, updated)
  }

  const total = items.reduce((sum, item) => sum + item.quantity * item.rate, 0)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Invoice Items</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Add products or services you&apos;re billing for. You can drag to reorder.
        </p>
      </div>

      <FormField label="Currency">
        <Select
          value={currency}
          onChange={(e) => onCurrencyChange(e.target.value)}
          options={CURRENCY_OPTIONS}
        />
      </FormField>

      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={item.id}
            draggable
            onDragStart={() => handleDragStart(item.id)}
            onDragOver={(e) => handleDragOver(e, item.id)}
            onDragEnd={handleDragEnd}
            className={`p-4 rounded-lg border-2 transition-colors ${
              draggedId === item.id
                ? 'border-brand bg-brand/5 opacity-50'
                : 'border-border bg-card hover:border-border-strong'
            } cursor-grab active:cursor-grabbing`}
          >
            <div className="flex gap-3">
              <GripVertical className="h-5 w-5 text-muted-foreground mt-3 flex-shrink-0" />

              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                <FormField label="Description" className="md:col-span-2">
                  <Input
                    value={item.description}
                    onChange={(e) => handleFieldChange(index, 'description', e.target.value)}
                    placeholder="What are you billing for?"
                  />
                </FormField>

                <FormField label="HSN / SAC">
                  <Input
                    value={item.hsn ?? ''}
                    onChange={(e) => handleFieldChange(index, 'hsn', e.target.value)}
                    placeholder="998314"
                  />
                </FormField>

                <FormField label="SKU">
                  <Input
                    value={item.sku ?? ''}
                    onChange={(e) => handleFieldChange(index, 'sku', e.target.value)}
                    placeholder="PROD-001"
                  />
                </FormField>

                <div className="md:col-span-3 grid grid-cols-3 gap-3">
                  <FormField label="Quantity">
                    <NumberInput
                      value={item.quantity}
                      onChange={(e) =>
                        handleFieldChange(index, 'quantity', parseFloat(e.target.value) || 0)
                      }
                      min="0"
                      step="1"
                    />
                  </FormField>

                  <FormField label="Unit">
                    <Input
                      value={item.unit}
                      onChange={(e) => handleFieldChange(index, 'unit', e.target.value)}
                      placeholder="hours, items, days"
                    />
                  </FormField>

                  <FormField label={`Rate (${currencySymbol(currency)})`}>
                    <NumberInput
                      value={item.rate}
                      onChange={(e) =>
                        handleFieldChange(index, 'rate', parseFloat(e.target.value) || 0)
                      }
                      min="0"
                      step="0.01"
                    />
                  </FormField>
                </div>

                <div className="md:col-span-3 flex items-end justify-between">
                  <p className="text-sm font-medium text-foreground">
                    Subtotal: {formatMoney(currency, item.quantity * item.rate)}
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => onDuplicateItem(item.id)}
                      className="p-2 rounded hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                      title="Duplicate item"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="p-2 rounded hover:bg-destructive/10 transition-colors text-destructive"
                      title="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 space-y-4">
        <div className="flex justify-between items-center bg-secondary/30 p-4 rounded-lg">
          <span className="font-medium text-foreground">Subtotal</span>
          <span className="text-lg font-semibold text-foreground">
            {formatMoney(currency, total)}
          </span>
        </div>

        <button
          onClick={onAddItem}
          className="w-full py-2 px-4 rounded-lg border-2 border-dashed border-border hover:border-brand hover:bg-brand/5 text-brand font-medium transition-colors"
        >
          + Add Item
        </button>
      </div>
    </div>
  )
}
