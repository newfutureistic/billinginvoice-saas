import { Prisma, type Product } from '@prisma/client'
import { TenantRepository } from '@/server/repositories/tenant.repository'
import { NotFoundError } from '@/server/db/errors'
import type { Paginated, PaginationInput } from '@/server/db/utils'
import type { CursorInput, CursorPage } from '@/server/repositories/cursor'
import type {
  ReadRepository,
  SoftDeleteRepository,
  WriteRepository,
} from '@/server/repositories/types'
import { buildOrderBy, type SortInput } from '@/server/utils/sort'

export const PRODUCT_SORTABLE = ['name', 'sku', 'price', 'category', 'quantity', 'createdAt', 'updatedAt'] as const

export interface ProductFilter {
  category?: string
  search?: string
}

export type ProductCreateData = Omit<Prisma.ProductUncheckedCreateInput, 'workspaceId'>

export interface ProductRepositoryContract
  extends ReadRepository<Product, ProductFilter>,
    WriteRepository<Product, ProductCreateData, Prisma.ProductUpdateInput>,
    SoftDeleteRepository<Product> {
  findBySku(sku: string): Promise<Product | null>
  hardDelete(id: string): Promise<Product>
  listDeleted(filter?: ProductFilter, pagination?: PaginationInput): Promise<Paginated<Product>>
  listCategories(): Promise<string[]>
}

/** Tenant-scoped catalogue items referenced by document line items. */
export class ProductRepository extends TenantRepository implements ProductRepositoryContract {
  private matchers(filter: ProductFilter = {}): Prisma.ProductWhereInput {
    return {
      category: filter.category,
      ...(filter.search
        ? {
            OR: [
              { name: { contains: filter.search, mode: 'insensitive' } },
              { sku: { contains: filter.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    }
  }

  private where(filter: ProductFilter = {}): Prisma.ProductWhereInput {
    return this.activeScope<Prisma.ProductWhereInput>(this.matchers(filter))
  }

  findById(id: string): Promise<Product | null> {
    return this.run(() =>
      this.db.product.findFirst({ where: this.activeScope<Prisma.ProductWhereInput>({ id }) }),
    )
  }

  findBySku(sku: string): Promise<Product | null> {
    return this.run(() =>
      this.db.product.findFirst({ where: this.activeScope<Prisma.ProductWhereInput>({ sku }) }),
    )
  }

  async requireById(id: string): Promise<Product> {
    const product = await this.findById(id)
    if (!product) throw new NotFoundError('Product', { id })
    return product
  }

  count(filter: ProductFilter = {}): Promise<number> {
    return this.run(() => this.db.product.count({ where: this.where(filter) }))
  }

  list(
    filter: ProductFilter = {},
    pagination?: PaginationInput,
    sort?: SortInput,
  ): Promise<Paginated<Product>> {
    const where = this.where(filter)
    const orderBy = sort ? buildOrderBy(sort) : { name: 'asc' as const }
    return this.paginate(
      pagination,
      () => this.db.product.count({ where }),
      (skip, take) => this.db.product.findMany({ where, orderBy, skip, take }),
    )
  }

  listCursor(filter: ProductFilter = {}, cursor?: CursorInput): Promise<CursorPage<Product>> {
    const where = this.where(filter)
    return this.cursorPage(cursor, (take, from) =>
      this.db.product.findMany({
        where,
        orderBy: { id: 'desc' },
        take,
        ...(from ? { cursor: { id: from }, skip: 1 } : {}),
      }),
    )
  }

  listDeleted(
    filter: ProductFilter = {},
    pagination?: PaginationInput,
  ): Promise<Paginated<Product>> {
    const where = this.scope<Prisma.ProductWhereInput>({
      ...this.matchers(filter),
      deletedAt: { not: null },
    })
    return this.paginate(
      pagination,
      () => this.db.product.count({ where }),
      (skip, take) => this.db.product.findMany({ where, orderBy: { deletedAt: 'desc' }, skip, take }),
    )
  }

  /** Distinct non-empty category labels across the active catalogue. */
  async listCategories(): Promise<string[]> {
    const rows = await this.run(() =>
      this.db.product.findMany({
        where: this.activeScope<Prisma.ProductWhereInput>({ category: { not: null } }),
        distinct: ['category'],
        select: { category: true },
        orderBy: { category: 'asc' },
      }),
    )
    return rows.map((r) => r.category).filter((c): c is string => Boolean(c))
  }

  create(data: ProductCreateData): Promise<Product> {
    return this.run(() =>
      this.db.product.create({ data: { ...data, workspaceId: this.workspaceId } }),
    )
  }

  async update(id: string, data: Prisma.ProductUpdateInput): Promise<Product> {
    await this.requireById(id)
    return this.run(() => this.db.product.update({ where: { id }, data }))
  }

  async softDelete(id: string): Promise<Product> {
    await this.requireById(id)
    return this.run(() => this.db.product.update({ where: { id }, data: { deletedAt: new Date() } }))
  }

  async restore(id: string): Promise<Product> {
    const res = await this.run(() =>
      this.db.product.updateMany({
        where: this.scope<Prisma.ProductWhereInput>({ id }),
        data: { deletedAt: null },
      }),
    )
    if (res.count === 0) throw new NotFoundError('Product', { id })
    return this.requireById(id)
  }

  async hardDelete(id: string): Promise<Product> {
    const existing = await this.run(() =>
      this.db.product.findFirst({ where: this.scope<Prisma.ProductWhereInput>({ id }) }),
    )
    if (!existing) throw new NotFoundError('Product', { id })
    await this.run(() => this.db.product.delete({ where: { id } }))
    return existing
  }
}
