import { iso } from '@/lib/dto/common.dto'
import { decimalToNumber, decimalToNumberOrNull } from '@/server/utils/decimal'
import type { AdminDocumentRow, AdminDownloadLogRow } from '@/server/repositories/admin-invoice.repository'

/** One row in the site-admin "All Invoices" list — a saved workspace document or a
 *  builder-page download, normalized to the same shape. */
export interface AdminInvoiceDTO {
  id: string
  source: 'dashboard' | 'builder'
  invoiceNumber: string | null
  businessName: string | null
  clientName: string | null
  currency: string | null
  total: number | null
  user: { id: string; name: string | null; email: string } | null
  workspace: { id: string; name: string } | null
  createdAt: string
  /** True only when a PDF actually exists to download (dashboard docs generate lazily on
   *  first request; builder downloads always have one by the time they're logged). */
  hasPdf: boolean
}

function jsonString(value: unknown, key: string): string | null {
  if (value && typeof value === 'object' && key in value) {
    const v = (value as Record<string, unknown>)[key]
    return typeof v === 'string' && v.trim() ? v : null
  }
  return null
}

export function toAdminInvoiceFromDocument(doc: AdminDocumentRow): AdminInvoiceDTO {
  return {
    id: doc.id,
    source: 'dashboard',
    invoiceNumber: doc.number,
    businessName: jsonString(doc.issuer, 'businessName'),
    clientName: jsonString(doc.recipient, 'clientName'),
    currency: doc.currency,
    total: decimalToNumber(doc.total),
    user: doc.createdBy ? { id: doc.createdBy.id, name: doc.createdBy.name, email: doc.createdBy.email } : null,
    workspace: { id: doc.workspace.id, name: doc.workspace.name },
    createdAt: iso(doc.createdAt),
    hasPdf: doc.pdfFile !== null,
  }
}

export function toAdminInvoiceFromDownloadLog(log: AdminDownloadLogRow): AdminInvoiceDTO {
  return {
    id: log.id,
    source: 'builder',
    invoiceNumber: log.invoiceNumber,
    businessName: log.businessName,
    clientName: log.clientName,
    currency: log.currency,
    total: decimalToNumberOrNull(log.total),
    user: log.user ? { id: log.user.id, name: log.user.name, email: log.user.email } : null,
    workspace: null,
    createdAt: iso(log.createdAt),
    hasPdf: true,
  }
}
