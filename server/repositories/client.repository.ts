import { Prisma, type Client } from '@prisma/client'
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

export const CLIENT_SORTABLE = ['name', 'email', 'status', 'createdAt', 'updatedAt'] as const

export interface ClientFilter {
  status?: string
  search?: string
}

export type ClientCreateData = Omit<Prisma.ClientUncheckedCreateInput, 'workspaceId'>

export interface ClientRepositoryContract
  extends ReadRepository<Client, ClientFilter>,
    WriteRepository<Client, ClientCreateData, Prisma.ClientUpdateInput>,
    SoftDeleteRepository<Client> {
  hardDelete(id: string): Promise<Client>
  listDeleted(filter?: ClientFilter, pagination?: PaginationInput): Promise<Paginated<Client>>
}

/** Tenant-scoped CRM records referenced by documents. */
export class ClientRepository extends TenantRepository implements ClientRepositoryContract {
  private matchers(filter: ClientFilter = {}): Prisma.ClientWhereInput {
    return {
      status: filter.status,
      ...(filter.search
        ? {
            OR: [
              { name: { contains: filter.search, mode: 'insensitive' } },
              { email: { contains: filter.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    }
  }

  private where(filter: ClientFilter = {}): Prisma.ClientWhereInput {
    return this.activeScope<Prisma.ClientWhereInput>(this.matchers(filter))
  }

  findById(id: string): Promise<Client | null> {
    return this.run(() =>
      this.db.client.findFirst({ where: this.activeScope<Prisma.ClientWhereInput>({ id }) }),
    )
  }

  async requireById(id: string): Promise<Client> {
    const client = await this.findById(id)
    if (!client) throw new NotFoundError('Client', { id })
    return client
  }

  count(filter: ClientFilter = {}): Promise<number> {
    return this.run(() => this.db.client.count({ where: this.where(filter) }))
  }

  list(
    filter: ClientFilter = {},
    pagination?: PaginationInput,
    sort?: SortInput,
  ): Promise<Paginated<Client>> {
    const where = this.where(filter)
    const orderBy = sort ? buildOrderBy(sort) : { name: 'asc' as const }
    return this.paginate(
      pagination,
      () => this.db.client.count({ where }),
      (skip, take) => this.db.client.findMany({ where, orderBy, skip, take }),
    )
  }

  /** Cursor (keyset) listing over active rows, newest first. */
  listCursor(filter: ClientFilter = {}, cursor?: CursorInput): Promise<CursorPage<Client>> {
    const where = this.where(filter)
    return this.cursorPage(cursor, (take, from) =>
      this.db.client.findMany({
        where,
        orderBy: { id: 'desc' },
        take,
        ...(from ? { cursor: { id: from }, skip: 1 } : {}),
      }),
    )
  }

  /** Soft-deleted rows only (recycle bin). */
  listDeleted(filter: ClientFilter = {}, pagination?: PaginationInput): Promise<Paginated<Client>> {
    const where = this.scope<Prisma.ClientWhereInput>({
      ...this.matchers(filter),
      deletedAt: { not: null },
    })
    return this.paginate(
      pagination,
      () => this.db.client.count({ where }),
      (skip, take) => this.db.client.findMany({ where, orderBy: { deletedAt: 'desc' }, skip, take }),
    )
  }

  create(data: ClientCreateData): Promise<Client> {
    return this.run(() =>
      this.db.client.create({ data: { ...data, workspaceId: this.workspaceId } }),
    )
  }

  async update(id: string, data: Prisma.ClientUpdateInput): Promise<Client> {
    await this.requireById(id)
    return this.run(() => this.db.client.update({ where: { id }, data }))
  }

  async softDelete(id: string): Promise<Client> {
    await this.requireById(id)
    return this.run(() => this.db.client.update({ where: { id }, data: { deletedAt: new Date() } }))
  }

  async restore(id: string): Promise<Client> {
    const res = await this.run(() =>
      this.db.client.updateMany({
        where: this.scope<Prisma.ClientWhereInput>({ id }),
        data: { deletedAt: null },
      }),
    )
    if (res.count === 0) throw new NotFoundError('Client', { id })
    return this.requireById(id)
  }

  /** Permanent delete (tenant-scoped; works on live or soft-deleted rows). */
  async hardDelete(id: string): Promise<Client> {
    const existing = await this.run(() =>
      this.db.client.findFirst({ where: this.scope<Prisma.ClientWhereInput>({ id }) }),
    )
    if (!existing) throw new NotFoundError('Client', { id })
    await this.run(() => this.db.client.delete({ where: { id } }))
    return existing
  }
}
