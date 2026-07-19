'use client'

import { INVOICE_STEPS } from '@/lib/invoice-state'
import { INVOICE_TEMPLATES } from '@/lib/invoice-templates'
import { useInvoice } from '@/lib/hooks/use-invoice'
import { ChevronDown, RotateCcw, RotateCw, Save, CheckCircle2, AlertCircle, AlertTriangle, Eye, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import type { InvoiceData } from '@/lib/invoice-types'
import { Step1Business } from './step-1-business'
import { Step2Client } from './step-2-client'
import { Step3Items } from './step-3-items'
import { Step4Taxes } from './step-4-taxes'
import { Step5Discount } from './step-5-discount'
import { Step6Shipping, Step7Notes, Step8Terms } from './step-6-8-additional'
import { Step9Branding, Step10Preview } from './step-9-10-final'
import { InvoicePreview } from './invoice-preview'
import { validateInvoiceData, validateStep } from '@/lib/invoice-validation'
import { useInvoiceDraft } from '@/lib/api/hooks/use-invoice-builder'
import { useWorkspaceBootstrap } from '@/lib/api/hooks/use-workspace-bootstrap'
import { invoiceToDocumentInput } from '@/lib/invoice-document'
import { ApiError } from '@/lib/api/errors'
import { writeDraft, clearDraft } from '@/lib/invoice-draft-storage'

export function InvoiceBuilder({
  invoiceId,
  initialInvoice,
}: {
  invoiceId?: string
  initialInvoice?: InvoiceData
} = {}) {
  // Enable tenant queries on this public route for signed-in users (saving needs it).
  useWorkspaceBootstrap()
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
    updateCurrency,
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
    updatePayment,
    updateBankDetails,
    updateMeta,
    switchTemplate,
  } = useInvoice(initialInvoice)

  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const stepCount = INVOICE_STEPS.length

  // Real persistence (reuses the Document CRUD via useInvoiceDraft: create-then-update).
  const draft = useInvoiceDraft(invoiceId)
  const [saveNotice, setSaveNotice] = useState<
    | { type: 'success'; number: string }
    | { type: 'error'; message: string }
    | null
  >(null)
  const [dirty, setDirty] = useState(false)
  const [showMobilePreview, setShowMobilePreview] = useState(false)
  const formScrollRef = useRef<HTMLDivElement>(null)

  // Per-step validation: a step may not be left while it has blocking errors. Errors are only
  // surfaced once the user tries to advance, so the form never nags while they are still typing.
  const [stepErrors, setStepErrors] = useState<string[]>([])
  const currentStepErrors = validateStep(currentStep, invoice)
  const goNext = () => {
    const errs = validateStep(currentStep, invoice)
    if (errs.length > 0) {
      setStepErrors(errs)
      formScrollRef.current?.scrollTo?.({ top: 0, behavior: 'smooth' })
      return
    }
    setStepErrors([])
    setCurrentStep((s) => Math.min(stepCount, s + 1))
  }
  // Clear the blocking banner as soon as the user has fixed the step.
  useEffect(() => {
    if (stepErrors.length > 0 && currentStepErrors.length === 0) setStepErrors([])
  }, [currentStepErrors.length, stepErrors.length])

  // Draft autosave: persist unsaved new invoices to the browser so a reload can recover them.
  useEffect(() => {
    if (!invoiceId && !draft.draftId) writeDraft(invoice)
  }, [invoice, invoiceId, draft.draftId])

  async function handleSave() {
    setSaveNotice(null)
    const errors = validateInvoiceData(invoice)
    if (errors.length > 0) {
      setSaveNotice({ type: 'error', message: errors[0] })
      return
    }
    try {
      const saved = await draft.save(invoiceToDocumentInput(invoice))
      clearDraft() // persisted to the server — drop the local recovery copy
      setDirty(false)
      setSaveNotice({ type: 'success', number: saved.number })
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.code === 'UNAUTHENTICATED' || err.status === 401
            ? 'Please sign in to save this invoice.'
            : err.message
          : 'Could not save the invoice. Please try again.'
      setSaveNotice({ type: 'error', message })
    }
  }

  // Latest actions for the global keyboard-shortcut handler (bound once, always current).
  const actionsRef = useRef({ save: handleSave, undo, redo, canUndo, canRedo, next: () => {} })
  actionsRef.current = {
    save: handleSave,
    undo,
    redo,
    canUndo,
    canRedo,
    next: goNext,
  }

  // Mark dirty on any edit after mount; cleared on save.
  const mountedRef = useRef(false)
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      return
    }
    setDirty(true)
  }, [invoice])

  // Keyboard shortcuts: Ctrl/Cmd+S save · Ctrl+Z undo · Ctrl+Shift+Z / Ctrl+Y redo · Ctrl+Enter next.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return
      const k = e.key.toLowerCase()
      const tag = (document.activeElement?.tagName || '').toLowerCase()
      const inField = tag === 'input' || tag === 'textarea' || tag === 'select'
      if (k === 's' && !e.shiftKey) {
        e.preventDefault()
        void actionsRef.current.save()
      } else if (k === 'enter') {
        e.preventDefault()
        actionsRef.current.next()
      } else if (k === 'z' && !e.shiftKey && !inField) {
        e.preventDefault()
        if (actionsRef.current.canUndo) actionsRef.current.undo()
      } else if ((k === 'y' || (k === 'z' && e.shiftKey)) && !inField) {
        e.preventDefault()
        if (actionsRef.current.canRedo) actionsRef.current.redo()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!dirty) return
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty])

  // Autoscroll to top + autofocus the first field when the step changes.
  useEffect(() => {
    setStepErrors([])
    formScrollRef.current?.scrollTo?.({ top: 0 })
    const id = window.setTimeout(() => {
      formScrollRef.current?.querySelector<HTMLElement>('input:not([type="hidden"]), textarea, select')?.focus?.()
    }, 40)
    return () => window.clearTimeout(id)
  }, [currentStep])

  function handleLogoClick() {
    if (dirty) {
      setShowLeaveConfirm(true)
    } else {
      router.push('/')
    }
  }

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
            onCurrencyChange={(c) => updateCurrency(c as InvoiceData['currency'])}
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
            additionalCharges={invoice.additionalCharges}
            roundOff={invoice.roundOff}
            currency={invoice.currency}
            onChange={updateShipping}
            onUpdateMeta={updateMeta}
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
            qrCode={invoice.qrCode}
            upiId={invoice.upiId}
            upiPayeeName={invoice.upiPayeeName}
            upiIncludeAmount={invoice.upiIncludeAmount}
            businessName={invoice.business.businessName}
            documentTitle={invoice.documentTitle}
            invoiceNumber={invoice.invoiceNumber}
            invoicePrefix={invoice.invoicePrefix}
            poNumber={invoice.poNumber}
            referenceNumber={invoice.referenceNumber}
            paymentMethod={invoice.paymentMethod}
            paymentStatus={invoice.paymentStatus}
            total={invoice.total}
            currency={invoice.currency}
            onUpdateTerms={updateTerms}
            onUpdatePaymentInstructions={updatePaymentInstructions}
            onUpdatePayment={updatePayment}
            onUpdateBankDetails={updateBankDetails}
            onUpdateMeta={updateMeta}
          />
        )
      case 9:
        return (
          <Step9Branding
            brandColor={invoice.brandColor}
            logoUrl={invoice.logoUrl}
            brandingSection={invoice.brandingSection}
            signatureUrl={invoice.signatureUrl}
            signatureLabel={invoice.signatureLabel}
            watermark={invoice.watermark}
            onUpdateBranding={updateBranding}
          />
        )
      case 10:
        return <Step10Preview invoice={invoice} validationErrors={validateInvoiceData(invoice)} />
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
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleLogoClick}
              className="flex shrink-0 items-center rounded transition-opacity hover:opacity-80"
              aria-label="Bill Maker — back to homepage"
              title="Back to homepage"
            >
              <Image src="/logo.png" alt="Bill Maker" width={2109} height={746} className="h-6 w-auto" priority />
            </button>
            <div className="h-5 w-px bg-border" aria-hidden />
            <h1 className="text-xl font-bold text-foreground">{invoice.invoiceNumber}</h1>
            {isSaving ? (
              <span className="text-xs text-muted-foreground animate-pulse flex items-center gap-1" role="status">
                <Save className="h-3 w-3" />
                Saving...
              </span>
            ) : dirty ? (
              <span className="text-xs text-warning flex items-center gap-1" role="status" aria-live="polite">
                <span className="h-2 w-2 rounded-full bg-warning" aria-hidden />
                Unsaved changes
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMobilePreview(true)}
              className="p-2 rounded hover:bg-secondary transition-colors lg:hidden"
              title="Preview"
              aria-label="Show invoice preview"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              onClick={undo}
              disabled={!canUndo}
              className="p-2 rounded hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Undo (Ctrl+Z)"
              aria-label="Undo"
              aria-keyshortcuts="Control+Z"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className="p-2 rounded hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Redo (Ctrl+Y)"
              aria-label="Redo"
              aria-keyshortcuts="Control+Y Control+Shift+Z"
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
        <div ref={formScrollRef} className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-2xl">
            {renderStep(currentStep)}
          </div>
        </div>

        {/* Blocking step validation errors (shown only after the user tries to advance) */}
        {stepErrors.length > 0 && (
          <div className="px-4 pt-3">
            <div
              id="step-errors"
              role="alert"
              aria-live="assertive"
              className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              <div className="flex items-center gap-2 font-medium">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                Please fix {stepErrors.length === 1 ? 'this' : `these ${stepErrors.length} issues`} to continue:
              </div>
              <ul className="mt-1 list-disc space-y-0.5 pl-9">
                {stepErrors.map((err) => (
                  <li key={err}>{err}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Save notice */}
        {saveNotice && (
          <div className="px-4 pt-3">
            {saveNotice.type === 'success' ? (
              <div className="flex items-center gap-2 rounded-lg border border-success/20 bg-success-muted px-3 py-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                <span className="text-foreground">
                  Saved as <span className="font-semibold">{saveNotice.number}</span>.
                </span>
                <Link href="/dashboard/invoices" className="ml-auto font-medium text-brand hover:underline whitespace-nowrap">
                  View in dashboard
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {saveNotice.message}
              </div>
            )}
          </div>
        )}

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
            onClick={currentStep === INVOICE_STEPS.length ? handleSave : goNext}
            disabled={draft.isSaving}
            aria-describedby={stepErrors.length > 0 ? 'step-errors' : undefined}
            className="flex-1 px-4 py-2 rounded-lg bg-brand hover:bg-brand/90 text-brand-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {currentStep === INVOICE_STEPS.length
              ? draft.isSaving
                ? 'Saving…'
                : draft.draftId
                  ? 'Update Invoice'
                  : 'Save Invoice'
              : 'Next'}
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

      {/* Leave-with-unsaved-changes confirmation (logo click) */}
      {showLeaveConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="leave-confirm-title"
        >
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-token-md">
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-warning/10 text-warning">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <div>
                <h2 id="leave-confirm-title" className="font-semibold text-foreground">
                  Leave without saving?
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  You have unsaved changes on this invoice. If you leave now, they will be lost.
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowLeaveConfirm(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                Stay on this page
              </button>
              <button
                type="button"
                onClick={() => router.push('/')}
                className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90"
              >
                Leave anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile preview overlay (additive; desktop 2-panel layout unchanged) */}
      {showMobilePreview && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background lg:hidden" role="dialog" aria-modal="true" aria-label="Invoice preview">
          <div className="flex items-center justify-between border-b border-border p-4">
            <span className="font-semibold text-foreground">Preview</span>
            <button
              onClick={() => setShowMobilePreview(false)}
              aria-label="Close preview"
              className="rounded p-2 hover:bg-secondary"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-auto">
            <InvoicePreview invoice={invoice} mode="mobile" />
          </div>
        </div>
      )}
    </div>
  )
}
