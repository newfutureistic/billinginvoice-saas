import { z } from 'zod'
import { planTierSchema } from '@/lib/validation/common.schema'

export const entitlementsSchema = z.object({
  docsPerMonth: z.number().int().nullable(),
  seats: z.number().int().positive(),
  allTools: z.boolean(),
  customBranding: z.boolean(),
  recurringBilling: z.boolean(),
  sharedTemplates: z.boolean(),
  approvalWorkflows: z.boolean(),
  rbacCustomRoles: z.boolean(),
  auditLog: z.boolean(),
  sso: z.boolean(),
  support: z.enum(['email', 'priority', 'dedicated']),
})

export const planSchema = z.object({
  tier: planTierSchema,
  name: z.string().min(1).max(60),
  priceMonthly: z.number().nonnegative(),
  priceAnnual: z.number().nonnegative(),
  entitlements: entitlementsSchema,
})

export type Entitlements = z.infer<typeof entitlementsSchema>
export type PlanInput = z.infer<typeof planSchema>
