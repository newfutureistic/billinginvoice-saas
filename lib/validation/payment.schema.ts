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

/** Body for recording a manual payment against a document (documentId comes from the path). */
export const recordPaymentBodySchema = z.object({
  amount: z.coerce.number().positive('Amount must be positive'),
  method: paymentMethodSchema,
  reference: z.string().max(200).optional(),
  receivedAt: z.string().optional(),
})
export type RecordPaymentBody = z.infer<typeof recordPaymentBodySchema>

export type PaymentRecordInput = z.infer<typeof paymentRecordSchema>
export type PaymentAllocationInput = z.infer<typeof paymentAllocationSchema>
