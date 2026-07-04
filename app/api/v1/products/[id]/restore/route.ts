import { z } from 'zod'
import { defineRoute } from '@/server/http/handler'
import { ProductService } from '@/server/services/product.service'
import { idSchema } from '@/lib/validation/common.schema'
import type { ProductOutputDTO } from '@/lib/dto/product.dto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const paramsSchema = z.object({ id: idSchema })
type Params = z.infer<typeof paramsSchema>

export const POST = defineRoute<ProductOutputDTO, undefined, undefined, Params>({
  permission: 'product:delete',
  schema: { params: paramsSchema },
  csrf: true,
  handler: ({ params, ctx }) => new ProductService(ctx).restore(params.id),
})
