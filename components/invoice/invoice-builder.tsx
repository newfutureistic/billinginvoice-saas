'use client'

import { INVOICE_STEPS } from '@/lib/invoice-state'
import { INVOICE_TEMPLATES } from '@/lib/invoice-templates'
import { useInvoice } from '@/lib/hooks/use-invoice'
import { ChevronDown, RotateCcw, RotateCw, Save } from 'lucide-react'
import { useState } from 'react'
import { Step1Business } from './step-1-business'
import { Step2Client } from './step-2-client'
import { Step3Items } from './step-3-items'
import { Step4Taxes } from './step-4-taxes'
import { Step5Discount } from './step-5-discount'
import { Step6Shipping, Step7Notes, Step8Terms } from './step-6-8-additional'
import { Step9Branding, Step10Preview } from './step-9-10-final'
import { InvoicePreview } from './invoice-preview'

export function InvoiceBuilder() {
  const {
    invoice,
    isSaving,
    canUndo,
    canRedo,
    undo,
    redo,
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
  } = useInvoice()

  const [currentStep, setCurrentStep] = useState(1)
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')

  const renderStep = (step: number) => {
    switch (step) {
      case 1:
        return <Step1Business business={invoice.business} onChange={updateBusinessDetails} />
      case 2:
        return <Step2Client client={invoice.client} onChange={updateClientDetails} />
      case 3:
        return (
          <Step3Items
            items={invoice.items}
            currency={invoice.currency}
            onAddItem={addItem}
            onUpdateItem={(idx, item) => {
              const updated = [...invoice.items]
              updated[idx] = item
              updateItems(updated)
            }}
            onDuplicateItem={duplicateItem}
            onRemoveItem={removeItem}
            onReorderItems={reorderItems}
          />
        )
      case 4:
        return (
          <Step4Taxes
            tax={invoice.tax}
            subtotal={invoice.subtotal}
            discount={invoice.discount}
            shipping={invoice.shipping}
            currency={invoice.currency}
            onChange={updateTax}
          />
        )
      case 5:
        return (
          <Step5Discount
            discount={invoice.discount}
            subtotal={invoice.subtotal}
            currency={invoice.currency}
            onChange={updateDiscount}
          />
        )
      case 6:
        return (
          <Step6Shipping
            shipping={invoice.shipping}
            currency={invoice.currency}
            onChange={updateShipping}
          />
        )
      case 7:
        return <Step7Notes notes={invoice.notes} onChange={updateNotes} />
      case 8:
        return (
          <Step8Terms
            terms={invoice.terms}
            paymentInstructions={invoice.paymentInstructions}
            bankDetails={invoice.bankDetails}
            onUpdateTerms={updateTerms}
            onUpdatePaymentInstructions={updatePaymentInstructions}
          />
        )
      case 9:
        return (
          <Step9Branding
            brandColor={invoice.brandColor}
            brandingSection={invoice.brandingSection}
            onUpdateBranding={updateBranding}
          />
        )
      case 10:
        return <Step10Preview invoice={invoice} validationErrors={[]} />
      default:
        return null
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Left Panel - Form */}
      <div className="flex flex-col w-full lg:w-1/2 border-r border-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-foreground">{invoice.invoiceNumber}</h1>
            {isSaving && (
              <span className="text-xs text-muted-foreground animate-pulse flex items-center gap-1">
                <Save className="h-3 w-3" />
                Saving...
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={undo}
              disabled={!canUndo}
              className="p-2 rounded hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Undo"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className="p-2 rounded hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Redo"
            >
              <RotateCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Template Selector */}
        <div className="px-4 py-3 border-b border-border bg-secondary/30">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-foreground">Template:</label>
            <select
              value={invoice.template}
              onChange={(e) => switchTemplate(e.target.value)}
              className="flex-1 rounded px-3 py-1 text-sm border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand"
            >
              {INVOICE_TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="px-4 py-3 bg-card border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              Step {currentStep} of {INVOICE_STEPS.length}
            </span>
            <span className="text-xs text-muted-foreground">{INVOICE_STEPS[currentStep - 1]?.title}</span>
          </div>
          <div className="h-1 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-brand transition-all duration-300"
              style={{ width: `${(currentStep / INVOICE_STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-2xl">
            {renderStep(currentStep)}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-3 p-4 border-t border-border bg-card sticky bottom-0">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="px-4 py-2 rounded-lg border border-border hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-foreground font-medium"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentStep(Math.min(INVOICE_STEPS.length, currentStep + 1))}
            disabled={currentStep === INVOICE_STEPS.length}
            className="flex-1 px-4 py-2 rounded-lg bg-brand hover:bg-brand-muted text-brand-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {currentStep === INVOICE_STEPS.length ? 'Complete' : 'Next'}
          </button>
        </div>
      </div>

      {/* Right Panel - Preview */}
      <div className="hidden lg:flex flex-col w-1/2 border-l border-border overflow-hidden">
        <div className="flex items-center justify-center gap-2 p-4 border-b border-border bg-card">
          <button
            onClick={() => setPreviewMode('mobile')}
            className={`px-3 py-1 text-sm rounded ${
              previewMode === 'mobile'
                ? 'bg-brand text-brand-foreground'
                : 'border border-border hover:bg-secondary'
            }`}
          >
            Mobile
          </button>
          <button
            onClick={() => setPreviewMode('tablet')}
            className={`px-3 py-1 text-sm rounded ${
              previewMode === 'tablet'
                ? 'bg-brand text-brand-foreground'
                : 'border border-border hover:bg-secondary'
            }`}
          >
            Tablet
          </button>
          <button
            onClick={() => setPreviewMode('desktop')}
            className={`px-3 py-1 text-sm rounded ${
              previewMode === 'desktop'
                ? 'bg-brand text-brand-foreground'
                : 'border border-border hover:bg-secondary'
            }`}
          >
            Desktop
          </button>
        </div>
        <InvoicePreview invoice={invoice} mode={previewMode} />
      </div>
    </div>
  )
}
