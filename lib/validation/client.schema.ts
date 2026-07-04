import { z } from 'zod'
import { emailSchema, listQuerySchema } from '@/lib/validation/common.schema'

export const clientStatusValues = ['active', 'inactive'] as const

export const clientCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  email: emailSchema.optional(),
  phone: z.string().max(50).optional(),
  address: z.string().max(500).optional(),
  taxId: z.string().max(50).optional(),
  status: z.enum(clientStatusValues).default('active'),
})

export const clientUpdateSchema = clientCreateSchema.partial()

export const clientFilterSchema = z.object({
  status: z.enum(clientStatusValues).optional(),
  search: z.string().max(200).optional(),
})

export const clientListQuerySchema = listQuerySchema(clientFilterSchema.shape)

export type ClientCreateInput = z.infer<typeof clientCreateSchema>
export type ClientUpdateInput = z.infer<typeof clientUpdateSchema>
export type ClientListQuery = z.infer<typeof clientListQuerySchema>
