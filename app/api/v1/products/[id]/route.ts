import { z } from 'zod'
import { defineRoute } from '@/server/http/handler'
import { ProductService } from '@/server/services/product.service'
import { productUpdateSchema, type ProductUpdateInput } from '@/lib/validation/product.schema'
import { idSchema } from '@/lib/validation/common.schema'
import type { ProductOutputDTO } from '@/lib/dto/product.dto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const paramsSchema = z.object({ id: idSchema })
const deleteQuerySchema = z.object({ permanent: z.coerce.boolean().optional() })
type Params = z.infer<typeof paramsSchema>
type DeleteQuery = z.infer<typeof deleteQuerySchema>

export const GET = defineRoute<ProductOutputDTO, undefined, undefined, Params>({
  permission: 'product:read',
  schema: { params: paramsSchema },
  handler: ({ params, ctx }) => new ProductService(ctx).get(params.id),
})

export const PATCH = defineRoute<ProductOutputDTO, ProductUpdateInput, undefined, Params>({
  permission: 'product:update',
  schema: { params: paramsSchema, body: productUpdateSchema },
  csrf: true,
  handler: ({ params, body, ctx }) => new ProductService(ctx).update(params.id, body),
})

export const DELETE = defineRoute<{ ok: true }, undefined, DeleteQuery, Params>({
  permission: 'product:delete',
  schema: { params: paramsSchema, query: deleteQuerySchema },
  csrf: true,
  handler: async ({ params, query, ctx }) => {
    const service = new ProductService(ctx)
    if (query.permanent) await service.hardDelete(params.id)
    else await service.remove(params.id)
    return { ok: true }
  },
})
