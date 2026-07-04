import type { Document, DocumentItem, Prisma } from '@prisma/client'
import { iso, isoOrNull } from '@/lib/dto/common.dto'
import { decimalToNumber } from '@/server/utils/decimal'
import type { DocumentWithItems } from '@/server/repositories/document.repository'

/** Output DTO for any document (invoice, quote, receipt, salary slip, …). */
export interface DocumentOutputDTO {
  id: string
  type: string
  number: string
  status: string
  currency: string
  issueDate: string
  dueDate: string | null
  issuer: Prisma.JsonValue
  recipient: Prisma.JsonValue
  clientId: string | null
  subtotal: number
  taxTotal: number
  total: number
  amountPaid: number
  notes: string | null
  terms: string | null
  templateId: string | null
  createdAt: string
  updatedAt: string
}

export function toDocumentDTO(doc: Document): DocumentOutputDTO {
  return {
    id: doc.id,
    type: doc.type,
    number: doc.number,
    status: doc.status,
    currency: doc.currency,
    issueDate: iso(doc.issueDate),
    dueDate: isoOrNull(doc.dueDate),
    issuer: doc.issuer,
    recipient: doc.recipient,
    clientId: doc.clientId,
    subtotal: decimalToNumber(doc.subtotal),
    taxTotal: decimalToNumber(doc.taxTotal),
    total: decimalToNumber(doc.total),
    amountPaid: decimalToNumber(doc.amountPaid),
    notes: doc.notes,
    terms: doc.terms,
    templateId: doc.templateId,
    createdAt: iso(doc.createdAt),
    updatedAt: iso(doc.updatedAt),
  }
}

/** A single document line item. */
export interface DocumentItemDTO {
  id: string
  productId: string | null
  description: string
  quantity: number
  rate: number
  unit: string | null
  taxRate: number
  amount: number
  position: number
}

export function toDocumentItemDTO(item: DocumentItem): DocumentItemDTO {
  return {
    id: item.id,
    productId: item.productId,
    description: item.description,
    quantity: decimalToNumber(item.quantity),
    rate: decimalToNumber(item.rate),
    unit: item.unit,
    taxRate: decimalToNumber(item.taxRate),
    amount: decimalToNumber(item.amount),
    position: item.position,
  }
}

/** Full document detail: the base projection plus its line items and JSON facets. */
export interface DocumentDetailDTO extends DocumentOutputDTO {
  items: DocumentItemDTO[]
  taxConfig: Prisma.JsonValue
  discount: Prisma.JsonValue
  shipping: Prisma.JsonValue
  paymentInstructions: string | null
}

export function toDocumentDetailDTO(doc: DocumentWithItems): DocumentDetailDTO {
  return {
    ...toDocumentDTO(doc),
    items: doc.items.map(toDocumentItemDTO),
    taxConfig: doc.taxConfig,
    discount: doc.discount,
    shipping: doc.shipping,
    paymentInstructions: doc.paymentInstructions,
  }
}
