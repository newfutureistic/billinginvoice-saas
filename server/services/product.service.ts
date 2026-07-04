import type { Product, Prisma } from '@prisma/client'
import { TenantCrudService } from '@/server/services/crud.service'
import {
  ProductRepository,
  PRODUCT_SORTABLE,
  type ProductCreateData,
  type ProductFilter,
} from '@/server/repositories/product.repository'
import {
  productCreateSchema,
  productUpdateSchema,
  type ProductCreateInput,
  type ProductUpdateInput,
} from '@/lib/validation/product.schema'
import { toProductDTO, type ProductOutputDTO } from '@/lib/dto/product.dto'
import { TenantRequiredError } from '@/server/errors/app-error'
import type { RequestContext } from '@/server/http/context'

/**
 * Product CRUD (Mission 5 §3). Inherits the full audited/soft-delete CRUD lifecycle from
 * {@link TenantCrudService}; exposes catalogue categories on top.
 */
export class ProductService extends TenantCrudService<
  Product,
  ProductOutputDTO,
  ProductCreateInput,
  ProductUpdateInput,
  ProductCreateData,
  Prisma.ProductUpdateInput,
  ProductFilter
> {
  protected readonly repo: ProductRepository
  protected readonly createSchema = productCreateSchema
  protected readonly updateSchema = productUpdateSchema
  protected readonly resource = 'Product'
  protected readonly sortable = PRODUCT_SORTABLE

  constructor(ctx: RequestContext) {
    super(ctx)
    if (!ctx.workspaceId) throw new TenantRequiredError()
    this.repo = new ProductRepository(ctx.workspaceId)
  }

  protected toDTO(model: Product): ProductOutputDTO {
    return toProductDTO(model)
  }

  protected toCreateData(input: ProductCreateInput): ProductCreateData {
    return {
      name: input.name,
      description: input.description ?? null,
      price: input.price,
      sku: input.sku,
      category: input.category ?? null,
      quantity: input.quantity,
    }
  }

  protected toUpdateData(input: ProductUpdateInput): Prisma.ProductUpdateInput {
    return input
  }

  protected entityId(model: Product): string {
    return model.id
  }

  protected entityLabel(model: Product): string {
    return model.name
  }

  /** Distinct product categories in the active catalogue (frozen products filter). */
  listCategories(): Promise<string[]> {
    return this.repo.listCategories()
  }
}
