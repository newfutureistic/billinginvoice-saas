import { z } from 'zod'
import {
  currencySchema,
  documentTypeValues,
  documentStatusValues,
  idSchema,
  listQuerySchema,
} from '@/lib/validation/common.schema'
import {
  businessDetailsSchema,
  clientDetailsSchema,
  invoiceItemSchema,
  taxConfigSchema,
  discountSchema,
  shippingSchema,
} from '@/lib/validation/invoice.schema'

/**
 * Generic document validation (Mission 5 §5). ONE schema drives every document type
 * (invoice, quote, estimate, receipt, purchase order, credit note, salary slip) — the
 * `type` selects behavior, never a separate schema. Reuses the frozen invoice
 * sub-schemas (business/client/items/tax/discount/shipping) so there is no duplicated
 * validation between the invoice builder and the generic engine.
 */
export const documentTypeSchema = z.enum(documentTypeValues)
export const documentStatusSchema = z.enum(documentStatusValues)

export const documentCreateSchema = z.object({
  type: documentTypeSchema.optional(),
  number: z.string().max(60).optional(),
  issueDate: z.string().min(1, 'Issue date is required'),
  dueDate: z.string().optional(),
  currency: currencySchema,
  clientId: idSchema.optional(),
  templateId: idSchema.optional(),
  business: businessDetailsSchema,
  client: clientDetailsSchema,
  items: z.array(invoiceItemSchema).min(1, 'At least one line item is required'),
  tax: taxConfigSchema,
  discount: discountSchema.optional(),
  shipping: shippingSchema.optional(),
  notes: z.string().max(2000).optional(),
  terms: z.string().max(2000).optional(),
  paymentInstructions: z.string().max(2000).optional(),
  // Persisted JSON facets (existing Document columns). Flexible objects so the frozen
  // builder can round-trip every business field without new tables/columns.
  branding: z.record(z.string(), z.unknown()).optional(),
  bankDetails: z.record(z.string(), z.unknown()).optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
})

export const documentUpdateSchema = documentCreateSchema.partial()

/** Status transition (e.g. send → SENT, mark paid → PAID). */
export const documentStatusUpdateSchema = z.object({
  status: documentStatusSchema,
})

export const documentFilterSchema = z.object({
  type: documentTypeSchema.optional(),
  status: documentStatusSchema.optional(),
  clientId: idSchema.optional(),
  search: z.string().max(200).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
})

export const documentListQuerySchema = listQuerySchema(documentFilterSchema.shape)

export type DocumentCreateInput = z.infer<typeof documentCreateSchema>
export type DocumentUpdateInput = z.infer<typeof documentUpdateSchema>
export type DocumentStatusUpdateInput = z.infer<typeof documentStatusUpdateSchema>
export type DocumentListQuery = z.infer<typeof documentListQuerySchema>
