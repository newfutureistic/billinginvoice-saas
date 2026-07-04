import { z } from 'zod'
import {
  currencySchema,
  emailSchema,
  hexColorSchema,
  slugSchema,
  taxTypeValues,
} from '@/lib/validation/common.schema'

// --- Workspace (the tenant container) ---------------------------------------
export const workspaceCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(120),
  slug: slugSchema,
})

export const workspaceUpdateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
})

// --- Organization (the business profile — WorkspaceSettings) ----------------
export const addressSchema = z.object({
  line1: z.string().max(200).optional(),
  city: z.string().max(120).optional(),
  state: z.string().max(120).optional(),
  zip: z.string().max(20).optional(),
  country: z.string().max(120).optional(),
})

export const organizationSettingsSchema = z.object({
  legalName: z.string().max(200).optional(),
  businessType: z.string().max(100).optional(),
  email: emailSchema.optional(),
  phone: z.string().max(50).optional(),
  address: addressSchema.optional(),
  taxId: z.string().max(50).optional(),
  taxRegion: z.string().max(2).optional(),
  defaultTaxType: z.enum(taxTypeValues).optional(),
  defaultCurrency: currencySchema.optional(),
  brandColor: hexColorSchema.optional(),
  numberFormat: z.string().max(60).optional(),
})

export type WorkspaceCreateInput = z.infer<typeof workspaceCreateSchema>
export type WorkspaceUpdateInput = z.infer<typeof workspaceUpdateSchema>
export type OrganizationSettingsInput = z.infer<typeof organizationSettingsSchema>
