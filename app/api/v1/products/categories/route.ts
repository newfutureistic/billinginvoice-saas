import { defineRoute } from '@/server/http/handler'
import { ProductService } from '@/server/services/product.service'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** GET /api/v1/products/categories — distinct catalogue categories (`product:read`). */
export const GET = defineRoute<{ categories: string[] }>({
  permission: 'product:read',
  handler: async ({ ctx }) => ({ categories: await new ProductService(ctx).listCategories() }),
})
