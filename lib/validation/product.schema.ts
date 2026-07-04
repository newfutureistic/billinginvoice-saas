import { z } from 'zod'
import { listQuerySchema } from '@/lib/validation/common.schema'

export const productCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(1000).optional(),
  price: z.number().nonnegative('Price cannot be negative'),
  sku: z.string().min(1, 'SKU is required').max(60),
  category: z.string().max(100).optional(),
  quantity: z.number().int().min(0).default(0),
})

export const productUpdateSchema = productCreateSchema.partial()

export const productFilterSchema = z.object({
  category: z.string().max(100).optional(),
  search: z.string().max(200).optional(),
})

export const productListQuerySchema = listQuerySchema(productFilterSchema.shape)

export type ProductCreateInput = z.infer<typeof productCreateSchema>
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>
export type ProductListQuery = z.infer<typeof productListQuerySchema>
