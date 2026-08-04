import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { renderInvoicePdf, type InvoicePdfInput, type InvoicePdfParty } from '@/server/pdf/invoice-pdf'
import { CURRENCIES } from '@/server/utils/currency'
import { defaultRateLimiter } from '@/server/http/middleware/rate-limit'
import { amountInWords, resolveInvoiceQr, taxLines } from '@/lib/invoice-format'
import { validateInvoiceData } from '@/lib/invoice-validation'
import { templateSpec } from '@/lib/invoice-template-spec'
import { MAX_LOGO_DATA_URL_CHARS, MAX_SIGNATURE_DATA_URL_CHARS } from '@/lib/validation/formats'
import { auth } from '@/server/auth'
import { prisma } from '@/server/db/prisma'
import { storageService } from '@/server/services/storage.service'
import { getIntegrationsEnv } from '@/server/config/env'
import { dbLogger } from '@/server/db/logger'
import type { Currency } from '@prisma/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/v1/invoice/render-pdf — public, stateless PDF rendering for the "try it free"
 * invoice builder. Renders straight from the posted builder data via the Mission-7
 * `renderInvoicePdf` engine and streams back the PDF bytes — no DB, no auth, no storage
 * bucket. Powers the Download / Print / Share buttons on the builder's review step.
 */

const partySchema = z
  .object({
    businessName: z.string().optional(),
    name: z.string().optional(),
    clientName: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
    taxId: z.string().optional(),
    gstin: z.string().optional(),
  })
  .passthrough()

const renderSchema = z.object({
  documentTitle: z.string().max(40).optional(),
  invoiceNumber: z.string().max(80).optional(),
  status: z.string().max(40).optional(),
  currency: z.string().max(8).optional(),
  issueDate: z.string().optional(),
  dueDate: z.string().nullable().optional(),
  business: partySchema.optional(),
  client: partySchema.optional(),
  items: z
    .array(
      z.object({
        description: z.string().default(''),
        hsn: z.string().optional(),
        sku: z.string().optional(),
        unit: z.string().optional(),
        quantity: z.coerce.number().default(0),
        rate: z.coerce.number().default(0),
      }),
    )
    .max(200)
    .default([]),
  subtotal: z.coerce.number().optional(),
  total: z.coerce.number().optional(),
  amountPaid: z.coerce.number().optional(),
  receipt: z.boolean().optional(),
  tax: z
    .object({
      type: z.string().default('Tax'),
      rate: z.coerce.number().default(0),
      basis: z.string().default('exclusive'),
      customLabel: z.string().optional(),
      supplyType: z.enum(['intra', 'inter']).optional(),
    })
    .optional(),
  discount: z.object({ type: z.string(), value: z.coerce.number(), applied: z.boolean() }).optional(),
  shipping: z.object({ cost: z.coerce.number(), applied: z.boolean() }).optional(),
  additionalCharges: z.object({ label: z.string().default(''), amount: z.coerce.number().default(0), applied: z.boolean().default(false) }).optional(),
  roundOff: z.boolean().optional(),
  template: z.string().max(60).nullish(),
  invoicePrefix: z.string().max(40).nullish(),
  poNumber: z.string().max(80).nullish(),
  referenceNumber: z.string().max(80).nullish(),
  paymentMethod: z.string().max(40).nullish(),
  paymentStatus: z.string().max(40).nullish(),
  notes: z.string().nullish(),
  terms: z.string().nullish(),
  paymentInstructions: z.string().max(2000).nullish(),
  bankDetails: z
    .object({
      accountName: z.string().optional(),
      accountNumber: z.string().optional(),
      routingNumber: z.string().optional(),
      bankName: z.string().optional(),
      branch: z.string().optional(),
      ifsc: z.string().optional(),
      swift: z.string().optional(),
      iban: z.string().optional(),
    })
    .passthrough()
    .optional(),
  qrCode: z.string().max(2048).nullish(),
  upiId: z.string().max(256).nullish(),
  upiPayeeName: z.string().max(256).nullish(),
  upiIncludeAmount: z.boolean().optional(),
  signatureUrl: z.string().max(MAX_SIGNATURE_DATA_URL_CHARS).nullish(),
  signatureLabel: z.string().max(120).nullish(),
  logoUrl: z.string().max(MAX_LOGO_DATA_URL_CHARS).nullish(),
  watermark: z.string().max(60).nullish(),
  brandColor: z.string().optional(),
  brandingSection: z.object({ showBrandColor: z.boolean().optional(), showLogo: z.boolean().optional() }).passthrough().optional(),
  // Set only by the Download button (not View/Print, and never by the live-preview pane's
  // debounced re-renders) — the signal that this render is worth logging for the
  // site-admin "All Invoices" list. See `logBuilderDownload` below.
  logDownload: z.boolean().optional(),
})

/**
 * Best-effort activity log for a builder-page (guest or signed-in) download: uploads the
 * rendered bytes to storage and records a row so the site-admin "All Invoices" list can
 * show it. Never allowed to fail the actual download — storage may not even be configured
 * yet (`SUPABASE_SERVICE_ROLE_KEY`/`SUPABASE_ANON_KEY` unset), in which case this just
 * logs a warning and the person still gets their PDF.
 */
async function logBuilderDownload(
  bytes: Uint8Array,
  meta: { invoiceNumber: string; businessName: string; clientName: string; currency: string; total: number },
  req: NextRequest,
): Promise<void> {
  try {
    const session = await auth()
    const userId = session?.user?.id ?? null
    const id = crypto.randomUUID()
    const bucket = getIntegrationsEnv().STORAGE_BUCKET
    const path = `guest-downloads/${id}.pdf`
    await storageService.upload(bucket, path, bytes, 'application/pdf')
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || null
    await prisma.invoiceDownloadLog.create({
      data: {
        id,
        userId,
        invoiceNumber: meta.invoiceNumber || null,
        businessName: meta.businessName || null,
        clientName: meta.clientName || null,
        currency: meta.currency || null,
        total: meta.total,
        bucket,
        path,
        sizeBytes: bytes.byteLength,
        ip,
      },
    })
  } catch (err) {
    dbLogger.warn('invoice.download_log_failed', { error: err instanceof Error ? err.message : String(err) })
  }
}

function toParty(p: z.infer<typeof partySchema> | undefined, nameKeys: string[]): InvoicePdfParty {
  const obj = (p ?? {}) as Record<string, unknown>
  const pick = (k: string) => (typeof obj[k] === 'string' ? (obj[k] as string).trim() : '')
  const name = nameKeys.map(pick).find(Boolean) ?? ''
  const cityLine = [pick('city'), pick('state'), pick('zipCode')].filter(Boolean).join(', ')
  const gstin = pick('gstin')
  const lines = [
    gstin ? `GSTIN: ${gstin}` : '',
    pick('pan') ? `PAN: ${pick('pan')}` : '',
    pick('email'),
    pick('phone'),
    pick('website'),
    pick('address'),
    cityLine,
    pick('country'),
    pick('taxId') ? `Tax ID: ${pick('taxId')}` : '',
  ].filter(Boolean)
  return { name, lines }
}

function safeCurrency(code: string | undefined): Currency {
  return code && code in CURRENCIES ? (code as Currency) : 'USD'
}

export async function POST(req: NextRequest) {
  // Lightweight per-IP rate limit (stateless render utility).
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'anon'
  const rl = await defaultRateLimiter.check(`render-pdf:${ip}`, { limit: 30, windowMs: 60_000 })
  if (!rl.allowed) {
    return NextResponse.json({ success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests' } }, { status: 429 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'Invalid JSON' } }, { status: 400 })
  }

  const parsed = renderSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid invoice data' } }, { status: 422 })
  }

  // Hard gate (shared rules): never render a structurally-invalid invoice — reject empty
  // business/client, missing items, negative discount/shipping, out-of-range tax, etc.
  const invoiceErrors = validateInvoiceData(body)
  if (invoiceErrors.length > 0) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: invoiceErrors[0], details: invoiceErrors } },
      { status: 422 },
    )
  }

  const data = parsed.data

  const items = data.items.map((it) => ({
    description: it.description,
    hsn: it.hsn,
    sku: it.sku,
    unit: it.unit,
    quantity: it.quantity,
    rate: it.rate,
    amount: Math.round(it.quantity * it.rate * 100) / 100,
  }))
  const subtotal = data.subtotal ?? items.reduce((s, i) => s + i.amount, 0)
  const discountAmount = data.discount?.applied
    ? data.discount.type === 'percentage'
      ? (subtotal * data.discount.value) / 100
      : data.discount.value
    : 0
  const shippingCost = data.shipping?.applied ? data.shipping.cost : 0
  const taxableBase = subtotal - discountAmount + shippingCost
  const taxRate = data.tax?.rate ?? 0
  const taxTotal =
    taxRate > 0
      ? data.tax?.basis === 'inclusive'
        ? (taxableBase * taxRate) / (100 + taxRate)
        : (taxableBase * taxRate) / 100
      : 0
  const total = data.total ?? (data.tax?.basis === 'inclusive' ? taxableBase : taxableBase + taxTotal)
  const useBrand = Boolean(data.brandingSection?.showBrandColor && data.brandColor)
  const currency = safeCurrency(data.currency)
  const roundedTotal = Math.round(total * 100) / 100
  const r2 = (n: number) => Math.round(n * 100) / 100

  const additionalAmount = data.additionalCharges?.applied ? data.additionalCharges.amount : 0
  const preRound = (data.tax?.basis === 'inclusive' ? taxableBase : taxableBase + taxTotal) + additionalAmount
  const roundOffAmount = data.roundOff ? r2(roundedTotal - preRound) : 0

  const chargeLines: { label: string; amount: number; negative?: boolean }[] = []
  if (data.discount?.applied && discountAmount)
    chargeLines.push({ label: `Discount${data.discount.type === 'percentage' ? ` (${data.discount.value}%)` : ''}`, amount: r2(discountAmount), negative: true })
  if (shippingCost) chargeLines.push({ label: 'Shipping', amount: r2(shippingCost) })
  if (additionalAmount) chargeLines.push({ label: data.additionalCharges?.label?.trim() || 'Additional Charge', amount: r2(additionalAmount) })

  const spec = templateSpec(data.template || 'modern')
  const bd = data.bankDetails ?? {}
  const bankLines = [
    bd.accountName ? `Account Holder: ${bd.accountName}` : '',
    bd.bankName ? `Bank: ${bd.bankName}` : '',
    bd.branch ? `Branch: ${bd.branch}` : '',
    bd.accountNumber ? `A/C No: ${bd.accountNumber}` : '',
    bd.ifsc ? `IFSC: ${bd.ifsc}` : '',
    bd.routingNumber ? `Routing: ${bd.routingNumber}` : '',
    bd.swift ? `SWIFT: ${bd.swift}` : '',
    bd.iban ? `IBAN: ${bd.iban}` : '',
    data.upiId ? `UPI: ${data.upiId}` : '',
  ].filter(Boolean)

  const gstTaxLines = taxLines(
    {
      type: data.tax?.type ?? 'Tax',
      rate: taxRate,
      supplyType: data.tax?.supplyType,
      customLabel: data.tax?.customLabel,
    },
    Math.round(taxTotal * 100) / 100,
  )

  const qrValue = resolveInvoiceQr({
    upiId: data.upiId,
    payeeName: data.upiPayeeName || data.business?.businessName,
    includeAmount: data.upiIncludeAmount,
    amount: roundedTotal,
    invoiceNumber: data.invoiceNumber,
    fallback: data.qrCode,
  })

  const customTitle = data.documentTitle?.trim()
  const input: InvoicePdfInput = {
    type: customTitle || (data.receipt ? 'RECEIPT' : 'INVOICE'),
    number: data.receipt ? `RCPT-${data.invoiceNumber || 'RECEIPT'}` : data.invoiceNumber || 'INVOICE',
    status: data.status || 'draft',
    currency,
    issueDate: data.issueDate || new Date().toISOString(),
    dueDate: data.dueDate || null,
    poNumber: data.poNumber ?? null,
    referenceNumber: data.referenceNumber ?? null,
    paymentMethod: data.paymentMethod ?? null,
    paymentStatus: data.paymentStatus ?? null,
    issuer: toParty(data.business, ['businessName', 'name']),
    recipient: toParty(data.client, ['clientName', 'name']),
    items,
    subtotal: Math.round(subtotal * 100) / 100,
    taxTotal: Math.round(taxTotal * 100) / 100,
    total: roundedTotal,
    amountPaid: data.amountPaid ?? 0,
    taxLabel: data.tax ? `${data.tax.type}${taxRate ? ` ${taxRate}%` : ''}` : undefined,
    taxLines: gstTaxLines,
    chargeLines,
    roundOffAmount: roundOffAmount || null,
    notes: data.notes ?? null,
    terms: data.terms ?? null,
    paymentInstructions: data.paymentInstructions ?? null,
    bankLines,
    brandColorHex: useBrand ? data.brandColor : null,
    qrCodeData: qrValue || null,
    amountInWords: amountInWords(roundedTotal, currency),
    logoDataUrl: data.brandingSection?.showLogo && data.logoUrl ? data.logoUrl : null,
    watermark: data.watermark ?? null,
    signatureDataUrl: data.signatureUrl ?? null,
    signatureLabel: data.signatureLabel ?? null,
    theme: {
      serif: spec.style.serif,
      header: spec.style.header,
      tableHeader: spec.style.tableHeader,
      accent: spec.colors.accent,
      primary: spec.colors.primary,
      text: spec.colors.text,
      totalsCard: spec.style.totalsCard,
      zebra: spec.style.zebra,
      category: spec.category,
      background: spec.colors.background,
    },
  }

  try {
    const bytes = await renderInvoicePdf(input)
    if (data.logDownload) {
      await logBuilderDownload(
        bytes,
        {
          invoiceNumber: data.invoiceNumber || '',
          businessName: data.business?.businessName || data.business?.name || '',
          clientName: data.client?.clientName || data.client?.name || '',
          currency,
          total: roundedTotal,
        },
        req,
      )
    }
    const filename = `${(data.invoiceNumber || 'invoice').replace(/[^A-Za-z0-9._-]/g, '_')}.pdf`
    return new NextResponse(Buffer.from(bytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to render PDF' } }, { status: 500 })
  }
}
