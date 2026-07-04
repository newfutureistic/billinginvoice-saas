import { z } from 'zod'
import { currencySchema } from '@/lib/validation/common.schema'

/**
 * Invoice input validation. This mirrors the frozen `InvoiceData` shape
 * (`lib/invoice-types.ts`) so it can validate what the frozen builder submits. It is a
 * SCHEMA ONLY — the invoice engine / CRUD is a separate, later mission.
 */

export const businessDetailsSchema = z.object({
  businessName: z.string().min(1).max(200),
  ownerName: z.string().max(200).optional().default(''),
  email: z.string().email().or(z.literal('')).optional(),
  phone: z.string().max(50).optional().default(''),
  address: z.string().max(300).optional().default(''),
  city: z.string().max(120).optional().default(''),
  state: z.string().max(120).optional().default(''),
  zipCode: z.string().max(20).optional().default(''),
  country: z.string().max(120).optional().default(''),
  taxId: z.string().max(60).optional().default(''),
  businessType: z.string().max(120).optional().default(''),
})

export const clientDetailsSchema = z.object({
  clientName: z.string().min(1).max(200),
  contactPerson: z.string().max(200).optional().default(''),
  email: z.string().email().or(z.literal('')).optional(),
  phone: z.string().max(50).optional().default(''),
  address: z.string().max(300).optional().default(''),
  city: z.string().max(120).optional().default(''),
  state: z.string().max(120).optional().default(''),
  zipCode: z.string().max(20).optional().default(''),
  country: z.string().max(120).optional().default(''),
  taxId: z.string().max(60).optional().default(''),
})

export const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Description is required').max(500),
  quantity: z.number().positive('Quantity must be positive'),
  rate: z.number().nonnegative('Rate cannot be negative'),
  unit: z.string().max(40).optional(),
})

export const taxConfigSchema = z.object({
  type: z.enum(['GST', 'VAT', 'Sales Tax', 'Custom']),
  rate: z.number().min(0).max(100),
  basis: z.enum(['inclusive', 'exclusive']),
  customLabel: z.string().max(40).optional(),
})

export const discountSchema = z.object({
  type: z.enum(['percentage', 'fixed']),
  value: z.number().nonnegative(),
  applied: z.boolean(),
})

export const shippingSchema = z.object({
  cost: z.number().nonnegative(),
  applied: z.boolean(),
})

export const invoiceCreateSchema = z.object({
  invoiceNumber: z.string().max(60).optional(),
  issueDate: z.string(),
  dueDate: z.string().optional(),
  template: z.string().max(60).optional(),
  business: businessDetailsSchema,
  client: clientDetailsSchema,
  items: z.array(invoiceItemSchema).min(1, 'At least one line item is required'),
  currency: currencySchema,
  discount: discountSchema.optional(),
  shipping: shippingSchema.optional(),
  tax: taxConfigSchema,
  notes: z.string().max(2000).optional(),
  terms: z.string().max(2000).optional(),
  paymentInstructions: z.string().max(2000).optional(),
})

export const invoiceUpdateSchema = invoiceCreateSchema.partial()

export type InvoiceItemInput = z.infer<typeof invoiceItemSchema>
export type InvoiceCreateInput = z.infer<typeof invoiceCreateSchema>
export type InvoiceUpdateInput = z.infer<typeof invoiceUpdateSchema>
