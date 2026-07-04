import type { Plan, Prisma } from '@prisma/client'
import { decimalToNumber } from '@/server/utils/decimal'

export interface PlanOutputDTO {
  id: string
  tier: string
  name: string
  priceMonthly: number
  priceAnnual: number
  entitlements: Prisma.JsonValue
}

export function toPlanDTO(plan: Plan): PlanOutputDTO {
  return {
    id: plan.id,
    tier: plan.tier,
    name: plan.name,
    priceMonthly: decimalToNumber(plan.priceMonthly),
    priceAnnual: decimalToNumber(plan.priceAnnual),
    entitlements: plan.entitlements,
  }
}
