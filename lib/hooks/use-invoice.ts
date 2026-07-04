'use client'

import { useCallback, useRef, useState } from 'react'
import { InvoiceData } from '../invoice-types'
import { MOCK_INVOICE, calculateInvoiceTotals } from '../invoice-state'

interface InvoiceHistory {
  past: InvoiceData[]
  present: InvoiceData
  future: InvoiceData[]
}

export function useInvoice(initialData?: InvoiceData) {
  const [history, setHistory] = useState<InvoiceHistory>({
    past: [],
    present: initialData ? calculateInvoiceTotals(initialData) as InvoiceData : (calculateInvoiceTotals(MOCK_INVOICE) as InvoiceData),
    future: [],
  })

  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const [isSaving, setIsSaving] = useState(false)

  // Get current invoice
  const invoice = history.present

  // Update invoice with undo/redo
  const updateInvoice = useCallback((updater: (current: InvoiceData) => InvoiceData) => {
    setHistory((prev) => {
      const updated = updater(prev.present)
      const calculated = calculateInvoiceTotals(updated) as InvoiceData
      return {
        past: [...prev.past, prev.present],
        present: calculated,
        future: [],
      }
    })
  }, [])

  // Undo
  const undo = useCallback(() => {
    setHistory((prev) => {
      if (prev.past.length === 0) return prev
      const newPresent = prev.past[prev.past.length - 1]
      return {
        past: prev.past.slice(0, -1),
        present: newPresent,
        future: [prev.present, ...prev.future],
      }
    })
  }, [])

  // Redo
  const redo = useCallback(() => {
    setHistory((prev) => {
      if (prev.future.length === 0) return prev
      const newPresent = prev.future[0]
      return {
        past: [...prev.past, prev.present],
        present: newPresent,
        future: prev.future.slice(1),
      }
    })
  }, [])

  // Autosave (mock)
  const autoSave = useCallback(() => {
    if (!invoice.autoSaveEnabled) return

    clearTimeout(autoSaveTimeoutRef.current)
    autoSaveTimeoutRef.current = setTimeout(() => {
      setIsSaving(true)
      // Simulate save delay
      setTimeout(() => {
        setIsSaving(false)
        // In real app, this would call an API
      }, 500)
    }, 1000)
  }, [invoice])

  // Field updaters
  const updateBusinessDetails = useCallback(
    (details: Partial<InvoiceData['business']>) => {
      updateInvoice((current) => ({
        ...current,
        business: { ...current.business, ...details },
      }))
      autoSave()
    },
    [updateInvoice, autoSave]
  )

  const updateClientDetails = useCallback(
    (details: Partial<InvoiceData['client']>) => {
      updateInvoice((current) => ({
        ...current,
        client: { ...current.client, ...details },
      }))
      autoSave()
    },
    [updateInvoice, autoSave]
  )

  const updateItems = useCallback(
    (items: InvoiceData['items']) => {
      updateInvoice((current) => ({
        ...current,
        items,
      }))
      autoSave()
    },
    [updateInvoice, autoSave]
  )

  const addItem = useCallback(
    (item?: Partial<InvoiceData['items'][0]>) => {
      const newItem = {
        id: Math.random().toString(36),
        description: item?.description || '',
        quantity: item?.quantity || 1,
        rate: item?.rate || 0,
        unit: item?.unit || 'hours',
      }
      updateItems([...invoice.items, newItem])
    },
    [invoice.items, updateItems]
  )

  const duplicateItem = useCallback(
    (itemId: string) => {
      const item = invoice.items.find((i) => i.id === itemId)
      if (!item) return
      const duplicate = { ...item, id: Math.random().toString(36) }
      updateItems([...invoice.items, duplicate])
    },
    [invoice.items, updateItems]
  )

  const removeItem = useCallback(
    (itemId: string) => {
      updateItems(invoice.items.filter((i) => i.id !== itemId))
    },
    [invoice.items, updateItems]
  )

  const reorderItems = useCallback(
    (items: InvoiceData['items']) => {
      updateItems(items)
    },
    [updateItems]
  )

  const updateTax = useCallback(
    (tax: Partial<InvoiceData['tax']>) => {
      updateInvoice((current) => ({
        ...current,
        tax: { ...current.tax, ...tax },
      }))
      autoSave()
    },
    [updateInvoice, autoSave]
  )

  const updateDiscount = useCallback(
    (discount: Partial<InvoiceData['discount']>) => {
      updateInvoice((current) => ({
        ...current,
        discount: { ...current.discount, ...discount },
      }))
      autoSave()
    },
    [updateInvoice, autoSave]
  )

  const updateShipping = useCallback(
    (shipping: Partial<InvoiceData['shipping']>) => {
      updateInvoice((current) => ({
        ...current,
        shipping: { ...current.shipping, ...shipping },
      }))
      autoSave()
    },
    [updateInvoice, autoSave]
  )

  const updateBranding = useCallback(
    (branding: Partial<Pick<InvoiceData, 'brandColor' | 'logoUrl' | 'brandingSection'>>) => {
      updateInvoice((current) => ({
        ...current,
        ...branding,
      }))
      autoSave()
    },
    [updateInvoice, autoSave]
  )

  const updateNotes = useCallback(
    (notes: string) => {
      updateInvoice((current) => ({
        ...current,
        notes,
      }))
      autoSave()
    },
    [updateInvoice, autoSave]
  )

  const updateTerms = useCallback(
    (terms: string) => {
      updateInvoice((current) => ({
        ...current,
        terms,
      }))
      autoSave()
    },
    [updateInvoice, autoSave]
  )

  const updatePaymentInstructions = useCallback(
    (instructions: string) => {
      updateInvoice((current) => ({
        ...current,
        paymentInstructions: instructions,
      }))
      autoSave()
    },
    [updateInvoice, autoSave]
  )

  const switchTemplate = useCallback(
    (templateId: string) => {
      updateInvoice((current) => ({
        ...current,
        template: templateId,
      }))
    },
    [updateInvoice]
  )

  const canUndo = history.past.length > 0
  const canRedo = history.future.length > 0

  return {
    // State
    invoice,
    isSaving,
    canUndo,
    canRedo,

    // Actions
    undo,
    redo,
    autoSave,
    updateInvoice,
    updateBusinessDetails,
    updateClientDetails,
    updateItems,
    addItem,
    removeItem,
    duplicateItem,
    reorderItems,
    updateTax,
    updateDiscount,
    updateShipping,
    updateBranding,
    updateNotes,
    updateTerms,
    updatePaymentInstructions,
    switchTemplate,
  }
}
