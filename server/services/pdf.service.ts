import type { Currency } from '@prisma/client'
import { BaseService } from '@/server/services/base.service'
import { AuditService } from '@/server/services/audit.service'
import { FileService, type DownloadUrl } from '@/server/services/file.service'
import { DocumentRepository, type DocumentWithItems } from '@/server/repositories/document.repository'
import { WorkspaceRepository } from '@/server/repositories/workspace.repository'
import { PaymentRepository } from '@/server/repositories/payment.repository'
import { renderInvoicePdf, type InvoicePdfInput, type InvoicePdfParty } from '@/server/pdf/invoice-pdf'
import { templateSpec } from '@/lib/invoice-template-spec'
import { decimalToNumber } from '@/server/utils/decimal'
import { NotFoundError, TenantRequiredError } from '@/server/errors/app-error'
import type { RequestContext } from '@/server/http/context'

function readJson(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}
function str(obj: Record<string, unknown>, ...keys: string[]): string {
  for (const k of keys) {
    const v = obj[k]
    if (typeof v === 'string' && v.trim()) return v.trim()
  }
  return ''
}

function partyFrom(json: unknown, nameKeys: string[]): InvoicePdfParty {
  const o = readJson(json)
  const name = str(o, ...nameKeys)
  const cityLine = [str(o, 'city'), str(o, 'state'), str(o, 'zipCode')].filter(Boolean).join(', ')
  const lines = [
    str(o, 'email'),
    str(o, 'phone'),
    str(o, 'address'),
    cityLine,
    str(o, 'country'),
    str(o, 'taxId') ? `Tax ID: ${str(o, 'taxId')}` : '',
  ].filter(Boolean)
  return { name, lines }
}

export interface PdfResult {
  fileId: string
  download: DownloadUrl
}

/**
 * PDF service (Mission 7). Turns a stored `Document` into a PDF: load (+ items + branding),
 * render via the pure `renderInvoicePdf` engine, store the bytes through `FileService`
 * (as an `INVOICE_PDF`/`DOCUMENT_PDF` `FileObject`), and repoint `Document.pdfFileId`.
 * One engine serves every document type (invoice, quote, receipt, PO, …).
 */
export class PdfService extends BaseService {
  private readonly wsId: string
  private readonly docs: DocumentRepository
  private readonly files: FileService
  private readonly workspaces: WorkspaceRepository
  private readonly payments: PaymentRepository
  private readonly audit: AuditService

  constructor(ctx: RequestContext) {
    super(ctx)
    if (!ctx.workspaceId) throw new TenantRequiredError()
    this.wsId = ctx.workspaceId
    this.docs = new DocumentRepository(ctx.workspaceId)
    this.files = new FileService(ctx)
    this.workspaces = new WorkspaceRepository()
    this.payments = new PaymentRepository(ctx.workspaceId)
    this.audit = new AuditService(ctx)
  }

  /**
   * Render a payment receipt PDF (not stored) for a document, reusing the invoice engine
   * in RECEIPT mode: receipt number, the billed items, per-payment lines, amount paid and
   * remaining balance.
   */
  async renderReceiptBytes(documentId: string): Promise<{ bytes: Uint8Array; receiptNumber: string; doc: DocumentWithItems }> {
    const doc = await this.docs.findByIdWithItems(documentId)
    if (!doc) throw new NotFoundError('Document', { id: documentId })
    const settings = await this.workspaces.getSettings(this.wsId)
    const payments = await this.payments.listByDocument(documentId)
    const receiptNumber = `RCPT-${doc.number}`
    const receiptLines = payments.map((p) => {
      const when = p.receivedAt.toISOString().slice(0, 10)
      const amt = `${doc.currency} ${decimalToNumber(p.amount).toFixed(2)}`
      const ref = p.providerRef ? `  (${p.providerRef})` : ''
      return `${when}   ${p.method}${ref}   ${amt}`
    })
    const input = this.buildInput(doc, settings?.brandColor ?? null)
    input.type = 'RECEIPT'
    input.number = receiptNumber
    input.receiptLines = receiptLines
    const bytes = await renderInvoicePdf(input)
    return { bytes, receiptNumber, doc }
  }

  /** Generate (or regenerate) the PDF for a document, store it, and link it. */
  async generate(documentId: string): Promise<PdfResult> {
    const doc = await this.docs.findByIdWithItems(documentId)
    if (!doc) throw new NotFoundError('Document', { id: documentId })

    const settings = await this.workspaces.getSettings(this.wsId)
    const bytes = await renderInvoicePdf(this.buildInput(doc, settings?.brandColor ?? null))

    const kind = doc.type === 'INVOICE' ? 'INVOICE_PDF' : 'DOCUMENT_PDF'
    const file = await this.files.storeBuffer(kind, bytes, { mimeType: 'application/pdf' })
    await this.docs.update(documentId, { pdfFile: { connect: { id: file.id } } })

    await this.audit.record({
      action: 'document.pdf.generated',
      targetType: 'Document',
      targetId: documentId,
      after: { fileId: file.id, sizeBytes: bytes.byteLength },
    })
    return { fileId: file.id, download: await this.files.getDownloadUrl(file.id) }
  }

  /** Return a URL for the document's PDF, generating it on first request. */
  async getOrCreateUrl(documentId: string): Promise<PdfResult> {
    const doc = await this.docs.requireById(documentId)
    if (!doc.pdfFileId) return this.generate(documentId)
    return { fileId: doc.pdfFileId, download: await this.files.getDownloadUrl(doc.pdfFileId) }
  }

  private buildInput(doc: DocumentWithItems, brandColor: string | null): InvoicePdfInput {
    const tax = readJson(doc.taxConfig)
    const taxType = str(tax, 'type')
    const taxRate = typeof tax.rate === 'number' ? tax.rate : Number(tax.rate ?? 0)
    // Match the on-screen template styling in the saved/emailed PDF too.
    const spec = templateSpec(doc.templateId ?? 'modern')
    return {
      type: doc.type,
      number: doc.number,
      status: doc.status,
      currency: doc.currency as Currency,
      issueDate: doc.issueDate.toISOString(),
      dueDate: doc.dueDate ? doc.dueDate.toISOString() : null,
      issuer: partyFrom(doc.issuer, ['businessName', 'name', 'legalName']),
      recipient: partyFrom(doc.recipient, ['clientName', 'name']),
      items: doc.items.map((it) => ({
        description: it.description,
        quantity: decimalToNumber(it.quantity),
        rate: decimalToNumber(it.rate),
        amount: decimalToNumber(it.amount),
      })),
      subtotal: decimalToNumber(doc.subtotal),
      taxTotal: decimalToNumber(doc.taxTotal),
      total: decimalToNumber(doc.total),
      amountPaid: decimalToNumber(doc.amountPaid),
      taxLabel: taxType ? `${taxType} ${taxRate}%` : undefined,
      notes: doc.notes,
      terms: doc.terms,
      brandColorHex: brandColor,
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
  }
}
