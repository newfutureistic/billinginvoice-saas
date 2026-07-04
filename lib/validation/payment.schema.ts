import { z } from 'zod'
import {
  currencySchema,
  idSchema,
  paymentMethodValues,
  paymentProviderValues,
} from '@/lib/validation/common.schema'

// Validation only — payment processing / webhooks are a later mission.
export const paymentMethodSchema = z.enum(paymentMethodValues)
export const paymentProviderSchema = z.enum(paymentProviderValues)

export const paymentRecordSchema = z.object({
  documentId: idSchema,
  amount: z.number().positive('Amount must be positive'),
  currency: currencySchema,
  method: paymentMethodSchema,
  provider: paymentProviderSchema.default('MANUAL'),
  reference: z.string().max(200).optional(),
  idempotencyKey: z.string().min(8).max(200),
  receivedAt: z.string().datetime().optional(),
})

export const paymentAllocationSchema = z.object({
  documentId: idSchema,
  amount: z.number().positive(),
})

export type PaymentRecordInput = z.infer<typeof paymentRecordSchema>
export type PaymentAllocationInput = z.infer<typeof paymentAllocationSchema>
