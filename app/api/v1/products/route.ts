import { defineRoute } from '@/server/http/handler'
import { ProductService } from '@/server/services/product.service'
import { productCreateSchema, productListQuerySchema } from '@/lib/validation/product.schema'
import type { ProductCreateInput, ProductListQuery } from '@/lib/validation/product.schema'
import type { ProductOutputDTO } from '@/lib/dto/product.dto'
import type { ListResult } from '@/server/http/response'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** GET /api/v1/products — paginated/filterable/sortable catalogue (`product:read`). */
export const GET = defineRoute<ListResult<ProductOutputDTO>, undefined, ProductListQuery>({
  permission: 'product:read',
  schema: { query: productListQuerySchema },
  handler: ({ query, ctx }) =>
    new ProductService(ctx).list(
      { category: query.category, search: query.search },
      { pagination: { page: query.page, pageSize: query.pageSize }, sort: query.sort },
    ),
})

/** POST /api/v1/products — create a catalogue item (`product:create`). */
export const POST = defineRoute<ProductOutputDTO, ProductCreateInput>({
  permission: 'product:create',
  schema: { body: productCreateSchema },
  csrf: true,
  status: 201,
  handler: ({ body, ctx }) => new ProductService(ctx).create(body),
})
