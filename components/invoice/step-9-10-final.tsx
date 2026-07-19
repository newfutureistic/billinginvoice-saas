'use client'

import { InvoiceData } from '@/lib/invoice-types'
import { FormField, Input } from './form-inputs'
import { AlertCircle, CheckCircle2, Download, Eye, ImageUp, Loader2, LogIn, PenLine, Printer, Share2, X } from 'lucide-react'
import { useRef, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { getGuestInvoiceCount, incrementGuestInvoiceCount, guestLimitReached, guestInvoiceLimit } from '@/lib/guest-usage'
import { accessConfig } from '@/lib/config/plans'
import {
  PDF_EMBEDDABLE_MIME_TYPES,
  MAX_LOGO_BYTES,
  MAX_SIGNATURE_BYTES,
  validateUploadType,
  validateUploadSize,
} from '@/lib/validation/formats'

type BrandingUpdate = Partial<
  Pick<InvoiceData, 'brandColor' | 'logoUrl' | 'brandingSection' | 'signatureUrl' | 'signatureLabel' | 'watermark'>
>

// Logos and signatures are BOTH embedded into the PDF, which only supports raster PNG/JPEG.
// Accepting SVG/WebP here let a logo render in the on-screen preview but silently vanish from
// the exported PDF (embedImageDataUrl returns null) — so both now use the same embeddable set.
const LOGO_MIMES = [...PDF_EMBEDDABLE_MIME_TYPES]
const SIGN_MIMES = [...PDF_EMBEDDABLE_MIME_TYPES]

export function Step9Branding({
  brandColor,
  logoUrl,
  brandingSection,
  signatureUrl,
  signatureLabel,
  watermark,
  onUpdateBranding,
}: {
  brandColor: string
  logoUrl?: string
  brandingSection: InvoiceData['brandingSection']
  signatureUrl?: string
  signatureLabel?: string
  watermark?: string
  onUpdateBranding: (branding: BrandingUpdate) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const sigRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sigError, setSigError] = useState<string | null>(null)

  // Validate BEFORE storing: an invalid file must never reach state, the preview, or the PDF.
  const readFile = (file: File | undefined) => {
    if (!file) return
    setError(null)
    const err = validateUploadType(file.type, LOGO_MIMES) ?? validateUploadSize(file.size, MAX_LOGO_BYTES)
    if (err) {
      setError(err)
      if (fileRef.current) fileRef.current.value = '' // allow re-picking the same file
      return
    }
    const reader = new FileReader()
    reader.onerror = () => setError('That image could not be read — the file may be corrupted.')
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      if (!result.startsWith('data:image/')) {
        setError('That image could not be read — the file may be corrupted.')
        return
      }
      onUpdateBranding({
        logoUrl: result,
        brandingSection: { ...brandingSection, showLogo: true },
      })
    }
    reader.readAsDataURL(file)
  }

  const readSignature = (file: File | undefined) => {
    if (!file) return
    setSigError(null)
    const err = validateUploadType(file.type, SIGN_MIMES) ?? validateUploadSize(file.size, MAX_SIGNATURE_BYTES)
    if (err) {
      setSigError(err)
      if (sigRef.current) sigRef.current.value = ''
      return
    }
    const reader = new FileReader()
    reader.onerror = () => setSigError('That image could not be read — the file may be corrupted.')
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      if (!result.startsWith('data:image/')) {
        setSigError('That image could not be read — the file may be corrupted.')
        return
      }
      onUpdateBranding({ signatureUrl: result })
    }
    reader.readAsDataURL(file)
  }

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
                brandingSection: { ...brandingSection, showBrandColor: e.target.checked },
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
                brandingSection: { ...brandingSection, showLogo: e.target.checked },
              })
            }
            className="w-4 h-4 rounded border border-border bg-background text-brand"
          />
          <span className="text-sm font-medium text-foreground">Show logo on invoice</span>
        </label>
      </div>

      {/* Logo upload — click to browse + drag & drop */}
      <FormField label="Logo">
        <input
          ref={fileRef}
          type="file"
          accept={LOGO_MIMES.join(',')}
          className="hidden"
          onChange={(e) => readFile(e.target.files?.[0])}
        />

        {logoUrl ? (
          <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoUrl}
              alt="Logo preview"
              className="h-16 w-16 rounded-md border border-border object-contain bg-background"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Logo added</p>
              <p className="text-xs text-muted-foreground">Shown on the invoice header</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={() => onUpdateBranding({ logoUrl: undefined })}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                title="Remove logo"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragging(false)
              readFile(e.dataTransfer.files?.[0])
            }}
            className={`flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors ${
              dragging
                ? 'border-brand bg-brand/5'
                : 'border-border bg-card hover:border-brand/50 hover:bg-secondary/30'
            }`}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-muted text-brand">
              <ImageUp className="h-5 w-5" />
            </span>
            <span className="text-sm font-medium text-foreground">
              Drop your logo here, or <span className="text-brand">click to browse</span>
            </span>
            <span className="text-xs text-muted-foreground">PNG, JPG, SVG or WebP · up to 2MB</span>
          </button>
        )}

        {error && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-destructive" role="alert">
            <AlertCircle className="h-3.5 w-3.5" />
            {error}
          </p>
        )}
      </FormField>

      {/* Signature / authorized signatory */}
      <FormField label="Signature">
        <input
          ref={sigRef}
          type="file"
          accept={SIGN_MIMES.join(',')}
          className="hidden"
          onChange={(e) => readSignature(e.target.files?.[0])}
        />

        {signatureUrl ? (
          <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={signatureUrl}
              alt="Signature preview"
              className="h-16 w-32 rounded-md border border-border bg-white object-contain"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Signature added</p>
              <p className="text-xs text-muted-foreground">Appears above the signatory line</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => sigRef.current?.click()}
                className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={() => onUpdateBranding({ signatureUrl: undefined })}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                title="Remove signature"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => sigRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-card px-4 py-6 text-center transition-colors hover:border-brand/50 hover:bg-secondary/30"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-muted text-brand">
              <PenLine className="h-5 w-5" />
            </span>
            <span className="text-sm font-medium text-foreground">
              Upload signature <span className="text-brand">(PNG or JPG)</span>
            </span>
            <span className="text-xs text-muted-foreground">Shown above the authorized-signatory line</span>
          </button>
        )}

        {sigError && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-destructive" role="alert">
            <AlertCircle className="h-3.5 w-3.5" />
            {sigError}
          </p>
        )}
      </FormField>

      <FormField label="Signatory Label">
        <Input
          value={signatureLabel ?? ''}
          onChange={(e) => onUpdateBranding({ signatureLabel: e.target.value })}
          placeholder="Authorized Signatory"
        />
      </FormField>

      <FormField label="Watermark">
        <Input
          value={watermark ?? ''}
          onChange={(e) => onUpdateBranding({ watermark: e.target.value })}
          placeholder="e.g., PAID, DRAFT, CONFIDENTIAL"
        />
      </FormField>
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
  const [busy, setBusy] = useState<null | 'view' | 'download' | 'print' | 'share'>(null)
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const { status } = useSession()
  const isGuest = status !== 'authenticated'
  const [guestBlocked, setGuestBlocked] = useState(false)

  /** Guest free-invoice gate: block the export once the soft limit is reached (sign-in required). */
  function blockedByGuestLimit(): boolean {
    if (isGuest && guestLimitReached()) {
      setGuestBlocked(true)
      setNotice(null)
      return true
    }
    return false
  }

  async function renderPdfBlob(): Promise<Blob> {
    const res = await fetch('/api/v1/invoice/render-pdf', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(invoice),
    })
    if (!res.ok) throw new Error('render failed')
    return res.blob()
  }

  async function handleView() {
    if (blockedByGuestLimit()) return
    // Open the tab synchronously, inside the click handler — a browser only trusts a popup as
    // "user-initiated" if it opens before the first `await`. Opening it after the PDF finishes
    // rendering loses that trust and gets silently blocked, so we open a blank tab now and point
    // it at the blob once it's ready.
    const pending = window.open('', '_blank')
    setBusy('view')
    setNotice(null)
    try {
      const blob = await renderPdfBlob()
      // A blob: URL renders in the browser's built-in PDF viewer reliably — unlike opening a
      // downloaded local file, which some browsers refuse to render.
      const url = URL.createObjectURL(blob)
      if (pending) {
        pending.location.href = url
      } else {
        setNotice({ type: 'error', msg: 'Allow pop-ups to open the PDF in a new tab, or use Download.' })
      }
      setTimeout(() => URL.revokeObjectURL(url), 60_000)
    } catch {
      pending?.close()
      setNotice({ type: 'error', msg: 'Could not open the PDF. Please try again.' })
    } finally {
      setBusy(null)
    }
  }

  async function handleDownload() {
    if (blockedByGuestLimit()) return
    setBusy('download')
    setNotice(null)
    try {
      const blob = await renderPdfBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${invoice.invoiceNumber || 'invoice'}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      // Defer revoke: revoking synchronously after click can truncate the
      // download while the browser is still reading from the object URL.
      setTimeout(() => URL.revokeObjectURL(url), 60_000)
      // A successful download is a completed guest invoice — count it toward the free allowance.
      if (isGuest) incrementGuestInvoiceCount()
      setNotice({ type: 'success', msg: 'PDF downloaded to your Downloads folder.' })
    } catch {
      setNotice({ type: 'error', msg: 'Could not generate the PDF. Please try again.' })
    } finally {
      setBusy(null)
    }
  }

  async function handlePrint() {
    if (blockedByGuestLimit()) return
    const pending = window.open('', '_blank')
    setBusy('print')
    setNotice(null)
    try {
      const blob = await renderPdfBlob()
      const url = URL.createObjectURL(blob)
      if (pending) {
        pending.addEventListener('load', () => pending.print())
        pending.location.href = url
      } else {
        setNotice({ type: 'error', msg: 'Allow pop-ups to print, or use Download.' })
      }
      setTimeout(() => URL.revokeObjectURL(url), 60_000)
    } catch {
      pending?.close()
      setNotice({ type: 'error', msg: 'Could not open the print view.' })
    } finally {
      setBusy(null)
    }
  }

  async function handleShare() {
    if (blockedByGuestLimit()) return
    setBusy('share')
    setNotice(null)
    try {
      const blob = await renderPdfBlob()
      const file = new File([blob], `${invoice.invoiceNumber || 'invoice'}.pdf`, { type: 'application/pdf' })
      const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean }
      if (nav.share && nav.canShare?.({ files: [file] })) {
        await nav.share({ files: [file], title: invoice.invoiceNumber, text: `Invoice ${invoice.invoiceNumber}` })
        setNotice({ type: 'success', msg: 'Shared.' })
      } else {
        await navigator.clipboard?.writeText(
          `Invoice ${invoice.invoiceNumber} — ${invoice.currency} ${invoice.total.toFixed(2)}`,
        )
        setNotice({ type: 'success', msg: 'Sharing not supported here — invoice summary copied to clipboard.' })
      }
    } catch (e) {
      if ((e as Error)?.name !== 'AbortError') setNotice({ type: 'error', msg: 'Could not share the invoice.' })
    } finally {
      setBusy(null)
    }
  }

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

      <div className="rounded-lg border border-border bg-card p-4">
        <p className="mb-3 text-sm text-muted-foreground">
          View the PDF in your browser, download it, print, or share it with your client.
        </p>
        {isGuest && (guestBlocked || getGuestInvoiceCount() >= guestInvoiceLimit) && (
          <div className="mb-3 rounded-lg border border-brand/30 bg-brand-muted/40 p-4" role="alert">
            <p className="text-sm font-semibold text-foreground">
              You&apos;ve created your {guestInvoiceLimit} free invoices.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create a free account to keep going — you get {accessConfig.monthlyInvoiceLimit} invoices every month,
              still completely free. No payment, no subscription.
            </p>
            <Link
              href="/auth/sign-in?callbackUrl=/invoice/new"
              className="mt-3 inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-token-sm transition-colors hover:bg-primary/90"
            >
              <LogIn className="size-4" /> Sign in — it&apos;s free
            </Link>
          </div>
        )}
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={handleView}
            disabled={busy !== null || !isValid}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy === 'view' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
            View PDF
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={busy !== null || !isValid}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-brand-foreground transition-colors hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy === 'download' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Download PDF
          </button>
          <button
            type="button"
            onClick={handlePrint}
            disabled={busy !== null || !isValid}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy === 'print' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
            Print
          </button>
          <button
            type="button"
            onClick={handleShare}
            disabled={busy !== null || !isValid}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy === 'share' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
            Share
          </button>
        </div>
        {notice && (
          <p className={`mt-3 text-xs ${notice.type === 'success' ? 'text-success' : 'text-destructive'}`} role="status">
            {notice.msg}
          </p>
        )}
      </div>
    </div>
  )
}
