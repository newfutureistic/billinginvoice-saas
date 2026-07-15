'use client'

import { InvoiceData, PreviewMode } from '@/lib/invoice-types'
import { getTemplate, InvoiceTemplate as TemplateMeta } from '@/lib/invoice-templates'
import { ZoomIn, ZoomOut } from 'lucide-react'
import { useState } from 'react'
import { QrImage } from './qr-image'
import { amountInWords, qrCaption, resolveInvoiceQr, taxLines } from '@/lib/invoice-format'
import { templateStyle } from '@/lib/invoice-template-spec'
import { formatMoney } from '@/lib/currency-format'

type Colors = { primary: string; accent: string; text: string; background: string }

/* -------------------------------------------------------------------------- */
/* Per-template visual variants — this is what makes each template distinct.   */
/* -------------------------------------------------------------------------- */

type HeaderVariant = 'band' | 'topbar' | 'plain' | 'split' | 'block' | 'minimal'
type TableHeader = 'filled' | 'underline' | 'soft'

interface Variant {
  serif: boolean
  header: HeaderVariant
  tableHeader: TableHeader
  zebra: boolean
  uppercaseLabels: boolean
  totalsCard: boolean
  radius: number
  softText: string // muted text color (derived)
}

const SERIF = 'Georgia, "Times New Roman", serif'

function variantFor(category: TemplateMeta['category'], colors: Colors): Variant {
  // Shared with the PDF renderer (lib/invoice-template-spec) so preview and PDF match.
  return { ...templateStyle(category), softText: withAlpha(colors.text, 0.62) }
}

/** Add alpha to a #rrggbb color → rgba() string. */
function withAlpha(hex: string, alpha: number): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex ?? '')
  if (!m) return `rgba(100,116,139,${alpha})`
  const n = parseInt(m[1], 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`
}

/* -------------------------------------------------------------------------- */
/* Preview shell — zoom + responsive frame                                     */
/* -------------------------------------------------------------------------- */

export function InvoicePreview({
  invoice,
  mode = 'desktop',
}: {
  invoice: InvoiceData
  mode?: PreviewMode
}) {
  const [zoom, setZoom] = useState(100)
  const template = getTemplate(invoice.template)
  const baseColors: Colors = template?.colors || {
    primary: '#0f172a',
    accent: '#2563eb',
    text: '#1f2937',
    background: '#ffffff',
  }

  // Brand-color override (the "Use brand color" toggle now actually works).
  const useBrand = Boolean(invoice.brandingSection?.showBrandColor && invoice.brandColor)
  const colors: Colors = useBrand
    ? { ...baseColors, primary: invoice.brandColor, accent: invoice.brandColor }
    : baseColors

  const variant = variantFor(template?.category ?? 'modern', colors)
  const width = mode === 'mobile' ? 380 : mode === 'tablet' ? 680 : 880
  const scale = zoom / 100

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Zoom Controls */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <span className="text-sm font-medium text-foreground">
          {mode.charAt(0).toUpperCase() + mode.slice(1)} Preview
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(Math.max(40, zoom - 10))}
            className="p-2 rounded hover:bg-secondary transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="w-12 text-center text-sm font-medium tabular-nums">{zoom}%</span>
          <button
            onClick={() => setZoom(Math.min(200, zoom + 10))}
            className="p-2 rounded hover:bg-secondary transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Canvas — top-aligned + content-height paper (no clipping, no dead space) */}
      <div className="flex-1 min-h-0 overflow-auto bg-secondary/40 flex justify-center items-start p-4 sm:p-6">
        <div
          style={
            {
              width,
              maxWidth: '100%',
              zoom: scale,
              backgroundColor: colors.background,
              color: colors.text,
              borderRadius: 12,
              boxShadow: '0 10px 30px -12px rgba(0,0,0,0.25)',
              fontFamily: variant.serif ? SERIF : 'var(--font-sans, inherit)',
            } as React.CSSProperties
          }
          className="overflow-hidden"
        >
          <InvoiceDocument invoice={invoice} colors={colors} variant={variant} />
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* The invoice document                                                        */
/* -------------------------------------------------------------------------- */

function money(currency: string, amount: number) {
  return formatMoney(currency, amount)
}

function InvoiceDocument({
  invoice,
  colors,
  variant,
}: {
  invoice: InvoiceData
  colors: Colors
  variant: Variant
}) {
  const docTitle = (invoice.documentTitle?.trim() || 'INVOICE').toUpperCase()
  // Totals (mirror lib/invoice-state calculateInvoiceTotals)
  const subtotal = invoice.subtotal
  const discountAmount = invoice.discount.applied
    ? invoice.discount.type === 'percentage'
      ? (subtotal * invoice.discount.value) / 100
      : invoice.discount.value
    : 0
  const shippingCost = invoice.shipping.applied ? invoice.shipping.cost : 0
  const taxableBase = subtotal - discountAmount + shippingCost
  const taxAmount =
    invoice.tax.rate > 0
      ? invoice.tax.basis === 'exclusive'
        ? (taxableBase * invoice.tax.rate) / 100
        : (taxableBase * invoice.tax.rate) / (100 + invoice.tax.rate)
      : 0
  const taxRows = taxLines(invoice.tax, taxAmount)

  const qrValue = resolveInvoiceQr({
    upiId: invoice.upiId,
    payeeName: invoice.upiPayeeName || invoice.business.businessName,
    includeAmount: invoice.upiIncludeAmount,
    amount: invoice.total,
    invoiceNumber: invoice.invoiceNumber,
    fallback: invoice.qrCode,
  })
  const hasQr = Boolean(qrValue)
  const hasSignature = Boolean(invoice.signatureUrl || invoice.signatureLabel?.trim())

  const showLogo = invoice.brandingSection?.showLogo
  const label = (s: string) =>
    variant.uppercaseLabels ? (
      <span className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: variant.softText }}>
        {s}
      </span>
    ) : (
      <span className="text-xs font-semibold" style={{ color: variant.softText }}>
        {s}
      </span>
    )

  const Logo = () =>
    showLogo && invoice.logoUrl ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={invoice.logoUrl} alt="Logo" className="mb-3 h-12 w-auto max-w-[160px] object-contain" />
    ) : showLogo ? (
      <div
        className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl text-lg font-bold"
        style={{ backgroundColor: withAlpha(colors.accent, 0.15), color: colors.accent }}
      >
        {(invoice.business.businessName || 'B').charAt(0)}
      </div>
    ) : null

  /* ----- Header variants ----- */
  const Header = () => {
    const name = invoice.business.businessName || 'Your Business'
    const bizLines = [
      invoice.business.address,
      [invoice.business.city, invoice.business.state].filter(Boolean).join(', '),
      invoice.business.gstin ? `GSTIN: ${invoice.business.gstin}` : '',
    ].filter(Boolean)

    if (variant.header === 'band' || variant.header === 'block') {
      const rounded = variant.header === 'block'
      return (
        <div
          className={rounded ? 'px-8 py-8' : 'px-8 py-7'}
          style={{
            background: `linear-gradient(135deg, ${colors.accent}, ${withAlpha(colors.accent, 0.82)})`,
            borderTopLeftRadius: rounded ? 0 : 0,
            borderBottomRightRadius: rounded ? 40 : 0,
          }}
        >
          <div className="flex items-start justify-between text-white">
            <div>
              {showLogo && invoice.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={invoice.logoUrl} alt="Logo" className="mb-3 h-12 w-auto max-w-[160px] object-contain" />
              ) : null}
              <h1 className="text-2xl font-bold leading-tight">{name}</h1>
              {bizLines.map((l, i) => (
                <p key={i} className="text-sm opacity-90">
                  {l}
                </p>
              ))}
            </div>
            <div className="text-right">
              <p className="text-3xl font-black tracking-tight opacity-95">{docTitle}</p>
              <p className="mt-1 text-sm opacity-90">{invoice.invoiceNumber}</p>
            </div>
          </div>
        </div>
      )
    }

    if (variant.header === 'split') {
      return (
        <div className="px-10 pt-10 pb-6 text-center">
          {showLogo ? (
            <div className="mb-3 flex justify-center">
              <Logo />
            </div>
          ) : null}
          <h1 className="text-2xl font-semibold tracking-wide" style={{ color: colors.primary }}>
            {name}
          </h1>
          {bizLines.length > 0 && (
            <p className="mt-1 text-sm" style={{ color: variant.softText }}>
              {bizLines.join(' · ')}
            </p>
          )}
          <div className="mx-auto mt-5 h-px w-24" style={{ backgroundColor: colors.accent }} />
          <p className="mt-4 text-sm font-semibold uppercase tracking-[0.3em]" style={{ color: colors.accent }}>
            Invoice
          </p>
        </div>
      )
    }

    if (variant.header === 'minimal') {
      return (
        <div className="px-9 pt-9 pb-5">
          <div className="flex items-end justify-between">
            <div>
              <Logo />
              <h1 className="text-xl font-semibold" style={{ color: colors.primary }}>
                {name}
              </h1>
            </div>
            <p className="text-sm font-medium uppercase tracking-[0.2em]" style={{ color: variant.softText }}>
              Invoice
            </p>
          </div>
          <div className="mt-4 h-px w-full" style={{ backgroundColor: withAlpha(colors.text, 0.12) }} />
        </div>
      )
    }

    // 'plain' / 'topbar'
    return (
      <div style={{ paddingTop: variant.header === 'topbar' ? 0 : undefined }}>
        {variant.header === 'topbar' && <div className="h-2 w-full" style={{ backgroundColor: colors.accent }} />}
        <div className="flex items-start justify-between px-8 pt-8 pb-6">
          <div>
            <Logo />
            <h1 className="text-2xl font-bold leading-tight" style={{ color: colors.primary }}>
              {name}
            </h1>
            {bizLines.map((l, i) => (
              <p key={i} className="text-sm" style={{ color: variant.softText }}>
                {l}
              </p>
            ))}
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold tracking-tight" style={{ color: colors.primary }}>
              {docTitle}
            </p>
            <p className="mt-1 text-sm" style={{ color: variant.softText }}>
              {invoice.invoiceNumber}
            </p>
          </div>
        </div>
        <div className="mx-8 h-0.5" style={{ backgroundColor: colors.accent }} />
      </div>
    )
  }

  /* ----- Meta + Bill To ----- */
  const Meta = () => (
    <div className="grid grid-cols-2 gap-8 px-8 pt-7">
      <div>
        {label('Bill To')}
        <p className="mt-1.5 text-base font-semibold" style={{ color: colors.primary }}>
          {invoice.client.clientName || 'Client name'}
        </p>
        {[
          invoice.client.address,
          [invoice.client.city, invoice.client.state].filter(Boolean).join(', '),
          invoice.client.gstin ? `GSTIN: ${invoice.client.gstin}` : '',
        ]
          .filter(Boolean)
          .map((l, i) => (
            <p key={i} className="text-sm" style={{ color: variant.softText }}>
              {l}
            </p>
          ))}
      </div>
      <div className="text-right">
        <div className="inline-grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <span style={{ color: variant.softText }}>Invoice #</span>
          <span className="font-medium">{invoice.invoiceNumber}</span>
          <span style={{ color: variant.softText }}>Date</span>
          <span className="font-medium">{fmtDate(invoice.issueDate)}</span>
          <span style={{ color: variant.softText }}>Due</span>
          <span className="font-medium">{fmtDate(invoice.dueDate)}</span>
        </div>
      </div>
    </div>
  )

  /* ----- Items table ----- */
  const thBase = 'px-3 py-2.5 text-xs font-semibold'
  const filled = variant.tableHeader === 'filled'
  const underline = variant.tableHeader === 'underline'
  const headStyle: React.CSSProperties = filled
    ? { backgroundColor: colors.accent, color: '#ffffff' }
    : underline
      ? { color: colors.accent, borderBottom: `2px solid ${colors.accent}` }
      : { backgroundColor: withAlpha(colors.accent, 0.12), color: colors.primary }

  const Items = () => (
    <div className="px-8 pt-7">
      <table className="w-full border-collapse text-sm" style={{ borderRadius: variant.radius, overflow: 'hidden' }}>
        <thead>
          <tr style={headStyle}>
            <th className={`${thBase} text-left`}>Description</th>
            <th className={`${thBase} text-right w-16`}>Qty</th>
            <th className={`${thBase} text-right w-24`}>Rate</th>
            <th className={`${thBase} text-right w-28`}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, idx) => (
            <tr
              key={item.id}
              style={{
                backgroundColor: variant.zebra && idx % 2 === 1 ? withAlpha(colors.text, 0.04) : 'transparent',
                borderBottom: `1px solid ${withAlpha(colors.text, 0.08)}`,
              }}
            >
              <td className="px-3 py-2.5 align-top">
                <div>{item.description || '—'}</div>
                {item.hsn ? (
                  <div className="text-xs" style={{ color: variant.softText }}>
                    HSN/SAC: {item.hsn}
                  </div>
                ) : null}
              </td>
              <td className="px-3 py-2.5 text-right align-top tabular-nums">{item.quantity}</td>
              <td className="px-3 py-2.5 text-right align-top tabular-nums">{money(invoice.currency, item.rate)}</td>
              <td className="px-3 py-2.5 text-right align-top font-medium tabular-nums">
                {money(invoice.currency, item.quantity * item.rate)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  /* ----- Totals ----- */
  const Row = ({ l, v, strong, danger }: { l: string; v: string; strong?: boolean; danger?: boolean }) => (
    <div
      className={`flex justify-between ${strong ? 'py-3 text-base font-bold' : 'py-1.5 text-sm'}`}
      style={{
        color: danger ? '#dc2626' : strong ? colors.primary : undefined,
        borderTop: strong ? `1px solid ${withAlpha(colors.text, 0.14)}` : undefined,
      }}
    >
      <span style={!strong && !danger ? { color: variant.softText } : undefined}>{l}</span>
      <span className="tabular-nums">{v}</span>
    </div>
  )

  const Totals = () => (
    <div className="flex justify-end px-8 pt-6">
      <div
        className="w-72"
        style={
          variant.totalsCard
            ? { backgroundColor: withAlpha(colors.accent, 0.07), borderRadius: variant.radius, padding: '10px 16px' }
            : undefined
        }
      >
        <Row l="Subtotal" v={money(invoice.currency, subtotal)} />
        {invoice.discount.applied && (
          <Row l="Discount" v={`-${money(invoice.currency, discountAmount)}`} danger />
        )}
        {invoice.shipping.applied && <Row l="Shipping" v={`+${money(invoice.currency, shippingCost)}`} />}
        {taxRows.map((line) => (
          <Row key={line.label} l={line.label} v={money(invoice.currency, line.amount)} />
        ))}
        <Row l="Total" v={money(invoice.currency, invoice.total)} strong />
      </div>
    </div>
  )

  /* ----- Amount in words ----- */
  const AmountWords = () => (
    <div className="px-8 pt-4">
      <p className="text-xs leading-relaxed" style={{ color: variant.softText }}>
        <span className="font-semibold" style={{ color: colors.primary }}>
          Amount in words:
        </span>{' '}
        {amountInWords(invoice.total, invoice.currency)}
      </p>
    </div>
  )

  /* ----- Footer ----- */
  const Footer = () =>
    invoice.notes || invoice.terms || hasQr || hasSignature ? (
      <div className="mt-8 px-8 pb-9 pt-6" style={{ borderTop: `1px solid ${withAlpha(colors.text, 0.1)}` }}>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
            {invoice.notes && (
              <div>
                {label('Notes')}
                <p className="mt-1 text-sm leading-relaxed" style={{ color: variant.softText }}>
                  {invoice.notes}
                </p>
              </div>
            )}
            {invoice.terms && (
              <div>
                {label('Terms')}
                <p className="mt-1 text-sm leading-relaxed" style={{ color: variant.softText }}>
                  {invoice.terms}
                </p>
              </div>
            )}
          </div>

          {(hasSignature || hasQr) && (
            <div className="flex shrink-0 flex-col items-center gap-5 sm:pl-4">
              {hasSignature && (
                <div className="flex flex-col items-center">
                  {invoice.signatureUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={invoice.signatureUrl} alt="Signature" className="h-12 w-40 object-contain" />
                  ) : (
                    <div className="h-12 w-40" />
                  )}
                  <div className="mt-1 h-px w-40" style={{ backgroundColor: withAlpha(colors.text, 0.4) }} />
                  <span className="mt-1 text-[11px] font-medium" style={{ color: variant.softText }}>
                    {invoice.signatureLabel?.trim() || 'Authorized Signatory'}
                  </span>
                </div>
              )}
              {hasQr && (
                <div className="flex flex-col items-center gap-2">
                  <div
                    className="rounded-lg bg-white p-2"
                    style={{ border: `1px solid ${withAlpha(colors.text, 0.12)}` }}
                  >
                    <QrImage value={qrValue} size={92} />
                  </div>
                  <span
                    className="text-[10px] font-semibold uppercase tracking-[0.14em]"
                    style={{ color: variant.softText }}
                  >
                    {qrCaption(qrValue)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    ) : (
      <div className="pb-9" />
    )

  return (
    <div>
      <Header />
      <Meta />
      <Items />
      <Totals />
      <AmountWords />
      <Footer />
    </div>
  )
}

function fmtDate(iso: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}
