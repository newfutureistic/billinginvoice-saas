import type { InvoiceData, Currency, TaxType, TaxBasis } from '@/lib/invoice-types'
import type { DocumentCreateInput } from '@/lib/validation/document.schema'
import type { DocumentDetailDTO } from '@/lib/dto/document.dto'
import { MOCK_INVOICE, calculateInvoiceTotals } from '@/lib/invoice-state'

/**
 * Bridge between the frozen builder's `InvoiceData` and the generic Document CRUD input.
 * Reuses the existing `documentCreateSchema` sub-shapes (business/client/items/tax/
 * discount/shipping) — no new validation. NOTE: the Document model does not carry the
 * builder-only extras (HSN/SAC, GST supplyType, UPI, signature, QR, brand colour/logo),
 * so those are not persisted through this bridge.
 */
export function invoiceToDocumentInput(invoice: InvoiceData): DocumentCreateInput {
  const b = invoice.business
  const c = invoice.client
  const clean = (s: string) => (s && s.trim() ? s.trim() : undefined)
  return {
    type: 'INVOICE',
    // Send a custom number only when the user edited it away from the demo default;
    // otherwise omit so the server allocates the next sequence number.
    number:
      invoice.invoiceNumber && invoice.invoiceNumber !== MOCK_INVOICE.invoiceNumber
        ? invoice.invoiceNumber
        : undefined,
    issueDate: invoice.issueDate || new Date().toISOString().slice(0, 10),
    dueDate: clean(invoice.dueDate),
    currency: invoice.currency,
    business: {
      businessName: b.businessName,
      ownerName: b.ownerName || '',
      email: clean(b.email),
      phone: b.phone || '',
      address: b.address || '',
      city: b.city || '',
      state: b.state || '',
      zipCode: b.zipCode || '',
      country: b.country || '',
      taxId: b.taxId || '',
      gstin: b.gstin || '',
      pan: b.pan || '',
      website: b.website || '',
      businessType: b.businessType || '',
    },
    client: {
      clientName: c.clientName,
      contactPerson: c.contactPerson || '',
      email: clean(c.email),
      phone: c.phone || '',
      address: c.address || '',
      city: c.city || '',
      state: c.state || '',
      zipCode: c.zipCode || '',
      country: c.country || '',
      taxId: c.taxId || '',
      gstin: c.gstin || '',
    },
    items: invoice.items.map((it) => ({
      description: it.description,
      quantity: it.quantity,
      rate: it.rate,
      unit: it.unit || undefined,
    })),
    tax: {
      type: invoice.tax.type,
      rate: invoice.tax.rate,
      basis: invoice.tax.basis,
      customLabel: clean(invoice.tax.customLabel ?? ''),
      supplyType: invoice.tax.supplyType,
    },
    discount: { type: invoice.discount.type, value: invoice.discount.value, applied: invoice.discount.applied },
    shipping: { cost: invoice.shipping.cost, applied: invoice.shipping.applied },
    notes: clean(invoice.notes),
    terms: clean(invoice.terms),
    paymentInstructions: clean(invoice.paymentInstructions),
    // Everything the frozen builder collects but the base columns don't hold, persisted
    // through the existing branding / bankDetails / payload JSON columns (no migration).
    branding: {
      brandColor: invoice.brandColor,
      logoUrl: invoice.logoUrl ?? '',
      template: invoice.template,
      showLogo: invoice.brandingSection?.showLogo ?? false,
      showBrandColor: invoice.brandingSection?.showBrandColor ?? false,
      signatureUrl: invoice.signatureUrl ?? '',
      signatureLabel: invoice.signatureLabel ?? '',
      qrCode: invoice.qrCode ?? '',
      watermark: invoice.watermark ?? '',
    },
    bankDetails: {
      accountName: invoice.bankDetails.accountName,
      accountNumber: invoice.bankDetails.accountNumber,
      routingNumber: invoice.bankDetails.routingNumber,
      bankName: invoice.bankDetails.bankName,
      ifsc: invoice.bankDetails.ifsc ?? '',
      swift: invoice.bankDetails.swift ?? '',
      iban: invoice.bankDetails.iban ?? '',
      branch: invoice.bankDetails.branch ?? '',
      upiId: invoice.upiId ?? '',
      upiPayeeName: invoice.upiPayeeName ?? '',
      upiIncludeAmount: invoice.upiIncludeAmount ?? false,
    },
    payload: {
      itemMeta: invoice.items.map((it) => ({ hsn: it.hsn ?? '', sku: it.sku ?? '' })),
      invoicePrefix: invoice.invoicePrefix ?? '',
      poNumber: invoice.poNumber ?? '',
      referenceNumber: invoice.referenceNumber ?? '',
      paymentMethod: invoice.paymentMethod ?? '',
      paymentStatus: invoice.paymentStatus ?? '',
      additionalCharges: invoice.additionalCharges ?? { label: '', amount: 0, applied: false },
      roundOff: invoice.roundOff ?? false,
    },
  }
}

function jstr(json: unknown, key: string): string {
  if (json && typeof json === 'object' && !Array.isArray(json)) {
    const v = (json as Record<string, unknown>)[key]
    if (typeof v === 'string') return v
  }
  return ''
}
function jnum(json: unknown, key: string): number {
  if (json && typeof json === 'object' && !Array.isArray(json)) {
    const v = (json as Record<string, unknown>)[key]
    if (typeof v === 'number') return v
    if (typeof v === 'string' && v.trim() !== '') return Number(v) || 0
  }
  return 0
}
function jbool(json: unknown, key: string): boolean {
  return Boolean(json && typeof json === 'object' && !Array.isArray(json) && (json as Record<string, unknown>)[key])
}

const STATUSES: InvoiceData['status'][] = ['draft', 'sent', 'paid', 'overdue']

/** Hydrate the builder from a saved Document (edit / continue-editing / duplicate source). */
function jobj(json: unknown): Record<string, unknown> {
  return json && typeof json === 'object' && !Array.isArray(json) ? (json as Record<string, unknown>) : {}
}

export function documentToInvoiceData(doc: DocumentDetailDTO): InvoiceData {
  const status = doc.status.toLowerCase() as InvoiceData['status']
  const branding = jobj(doc.branding)
  const bank = jobj(doc.bankDetails)
  const payload = jobj(doc.payload)
  const itemMeta = (Array.isArray(payload.itemMeta) ? payload.itemMeta : []) as Array<{ hsn?: string; sku?: string }>
  const ac = jobj(payload.additionalCharges)
  const bstr = (o: Record<string, unknown>, k: string) => (typeof o[k] === 'string' ? (o[k] as string) : '')
  const invoice: InvoiceData = {
    ...MOCK_INVOICE,
    id: doc.id,
    invoiceNumber: doc.number,
    issueDate: doc.issueDate.slice(0, 10),
    dueDate: doc.dueDate ? doc.dueDate.slice(0, 10) : '',
    status: STATUSES.includes(status) ? status : 'draft',
    currency: doc.currency as Currency,
    business: {
      businessName: jstr(doc.issuer, 'businessName'),
      ownerName: jstr(doc.issuer, 'ownerName'),
      email: jstr(doc.issuer, 'email'),
      phone: jstr(doc.issuer, 'phone'),
      address: jstr(doc.issuer, 'address'),
      city: jstr(doc.issuer, 'city'),
      state: jstr(doc.issuer, 'state'),
      zipCode: jstr(doc.issuer, 'zipCode'),
      country: jstr(doc.issuer, 'country'),
      taxId: jstr(doc.issuer, 'taxId'),
      gstin: jstr(doc.issuer, 'gstin'),
      pan: jstr(doc.issuer, 'pan'),
      website: jstr(doc.issuer, 'website'),
      businessType: jstr(doc.issuer, 'businessType'),
    },
    client: {
      clientName: jstr(doc.recipient, 'clientName'),
      contactPerson: jstr(doc.recipient, 'contactPerson'),
      email: jstr(doc.recipient, 'email'),
      phone: jstr(doc.recipient, 'phone'),
      address: jstr(doc.recipient, 'address'),
      city: jstr(doc.recipient, 'city'),
      state: jstr(doc.recipient, 'state'),
      zipCode: jstr(doc.recipient, 'zipCode'),
      country: jstr(doc.recipient, 'country'),
      taxId: jstr(doc.recipient, 'taxId'),
      gstin: jstr(doc.recipient, 'gstin'),
    },
    items: doc.items.map((it, i) => ({
      id: it.id,
      description: it.description,
      hsn: itemMeta[i]?.hsn || undefined,
      sku: itemMeta[i]?.sku || undefined,
      quantity: it.quantity,
      rate: it.rate,
      unit: it.unit || 'unit',
    })),
    tax: {
      type: (jstr(doc.taxConfig, 'type') || 'GST') as TaxType,
      rate: jnum(doc.taxConfig, 'rate'),
      basis: (jstr(doc.taxConfig, 'basis') || 'exclusive') as TaxBasis,
      supplyType: (jstr(doc.taxConfig, 'supplyType') || undefined) as InvoiceData['tax']['supplyType'],
    },
    discount: {
      type: (jstr(doc.discount, 'type') || 'percentage') as InvoiceData['discount']['type'],
      value: jnum(doc.discount, 'value'),
      applied: jbool(doc.discount, 'applied'),
    },
    shipping: { cost: jnum(doc.shipping, 'cost'), applied: jbool(doc.shipping, 'applied') },
    notes: doc.notes ?? '',
    terms: doc.terms ?? '',
    paymentInstructions: doc.paymentInstructions ?? '',
    template: bstr(branding, 'template') || MOCK_INVOICE.template,
    brandColor: bstr(branding, 'brandColor') || MOCK_INVOICE.brandColor,
    logoUrl: bstr(branding, 'logoUrl') || undefined,
    brandingSection: {
      showLogo: Boolean(branding.showLogo),
      showBrandColor: Boolean(branding.showBrandColor),
    },
    signatureUrl: bstr(branding, 'signatureUrl') || undefined,
    signatureLabel: bstr(branding, 'signatureLabel') || undefined,
    qrCode: bstr(branding, 'qrCode') || undefined,
    watermark: bstr(branding, 'watermark') || undefined,
    bankDetails: {
      accountName: bstr(bank, 'accountName'),
      accountNumber: bstr(bank, 'accountNumber'),
      routingNumber: bstr(bank, 'routingNumber'),
      bankName: bstr(bank, 'bankName'),
      ifsc: bstr(bank, 'ifsc') || undefined,
      swift: bstr(bank, 'swift') || undefined,
      iban: bstr(bank, 'iban') || undefined,
      branch: bstr(bank, 'branch') || undefined,
    },
    upiId: bstr(bank, 'upiId') || undefined,
    upiPayeeName: bstr(bank, 'upiPayeeName') || undefined,
    upiIncludeAmount: Boolean(bank.upiIncludeAmount),
    invoicePrefix: bstr(payload, 'invoicePrefix') || undefined,
    poNumber: bstr(payload, 'poNumber') || undefined,
    referenceNumber: bstr(payload, 'referenceNumber') || undefined,
    paymentMethod: (bstr(payload, 'paymentMethod') || undefined) as InvoiceData['paymentMethod'],
    paymentStatus: (bstr(payload, 'paymentStatus') || undefined) as InvoiceData['paymentStatus'],
    additionalCharges: {
      label: bstr(ac, 'label') || 'Additional charge',
      amount: jnum(ac, 'amount'),
      applied: jbool(ac, 'applied'),
    },
    roundOff: jbool(payload, 'roundOff'),
  }
  return calculateInvoiceTotals(invoice) as InvoiceData
}
