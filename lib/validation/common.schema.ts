import { z } from 'zod'

/**
 * Shared validation primitives. Schemas live here (not in `server/`) so the same
 * contract can later back both React Hook Form (client) and the service layer (server)
 * — a single source of truth for shapes. Mission 3 uses them server-side only.
 */

// --- Enum value tuples (mirror the Prisma enums) ----------------------------
export const currencyValues = [
  'USD',
  'EUR',
  'GBP',
  'CAD',
  'AUD',
  'INR',
  'JPY',
  'AED',
  'SGD',
  'CHF',
  'NZD',
  'SAR',
  'QAR',
] as const
export const taxTypeValues = ['GST', 'VAT', 'SALES_TAX', 'CUSTOM'] as const
export const planTierValues = ['FREE', 'PRO', 'BUSINESS'] as const
export const roleValues = ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER', 'VIEWER'] as const
export const documentTypeValues = [
  'INVOICE', 'QUOTE', 'RECEIPT', 'CREDIT_NOTE', 'SALARY_SLIP', 'PURCHASE_ORDER', 'PROPOSAL', 'DELIVERY_NOTE',
] as const
export const documentStatusValues = ['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'ACCEPTED', 'DECLINED', 'VOID'] as const
export const paymentMethodValues = ['CARD', 'BANK_TRANSFER', 'CASH', 'ONLINE', 'OTHER', 'UPI', 'CHEQUE', 'WALLET', 'NEFT_RTGS'] as const
export const paymentProviderValues = ['STRIPE', 'RAZORPAY', 'MANUAL'] as const
export const notificationCategoryValues = ['INVOICE', 'PAYMENT', 'SYSTEM', 'TEAM'] as const
export const fileKindValues = [
  'LOGO', 'AVATAR', 'INVOICE_PDF', 'DOCUMENT_PDF', 'EXPORT', 'ATTACHMENT', 'QR', 'BARCODE',
] as const

export const currencySchema = z.enum(currencyValues)
export const planTierSchema = z.enum(planTierValues)
export const roleSchema = z.enum(roleValues)

// --- Common field schemas ---------------------------------------------------
export const idSchema = z.string().min(1, 'id is required')
export const idParamsSchema = z.object({ id: idSchema })
export const emailSchema = z.string().email('Invalid email address')
export const slugSchema = z
  .string()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Must be a lowercase, hyphenated slug')
export const hexColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a hex color like #3b82f6')

// --- Pagination / sort query ------------------------------------------------
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})
export type PaginationQuery = z.infer<typeof paginationQuerySchema>

export const sortQuerySchema = z.object({ sort: z.string().optional() })

/** Compose pagination + sort + an entity filter into one query schema. */
export function listQuerySchema<T extends z.ZodRawShape>(filter: T) {
  return paginationQuerySchema.extend(sortQuerySchema.shape).extend(filter)
}

/** Cursor (keyset) pagination query. */
export const cursorQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})
export type CursorQuery = z.infer<typeof cursorQuerySchema>

/** Global-search query: a required term plus an optional per-entity result cap. */
export const searchQuerySchema = z.object({
  q: z.string().trim().min(1, 'Search query is required').max(200),
  limit: z.coerce.number().int().min(1).max(20).default(5),
})
export type SearchQuery = z.infer<typeof searchQuerySchema>

/** Dashboard window (months of history for the revenue series). */
export const dashboardQuerySchema = z.object({
  months: z.coerce.number().int().min(1).max(24).default(6),
})
export type DashboardQuery = z.infer<typeof dashboardQuerySchema>
