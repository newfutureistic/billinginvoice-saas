import { defineRoute } from '@/server/http/handler'
import { ProductService } from '@/server/services/product.service'
import { productListQuerySchema, type ProductListQuery } from '@/lib/validation/product.schema'
import type { ProductOutputDTO } from '@/lib/dto/product.dto'
import type { ListResult } from '@/server/http/response'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** GET /api/v1/products/deleted — recycle bin of soft-deleted products (`product:delete`). */
export const GET = defineRoute<ListResult<ProductOutputDTO>, undefined, ProductListQuery>({
  permission: 'product:delete',
  schema: { query: productListQuerySchema },
  handler: ({ query, ctx }) =>
    new ProductService(ctx).listDeleted(
      { category: query.category, search: query.search },
      { page: query.page, pageSize: query.pageSize },
    ),
})
