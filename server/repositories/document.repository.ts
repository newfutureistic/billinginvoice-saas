import { Prisma, type Document, type DocumentStatus, type DocumentType } from '@prisma/client'
import { TenantRepository } from '@/server/repositories/tenant.repository'
import { NotFoundError } from '@/server/db/errors'
import type { Paginated, PaginationInput } from '@/server/db/utils'
import type { CursorInput, CursorPage } from '@/server/repositories/cursor'
import type { ReadRepository, SoftDeleteRepository } from '@/server/repositories/types'
import { buildOrderBy, type SortInput } from '@/server/utils/sort'

/** Columns clients are allowed to sort the documents list by. */
export const DOCUMENT_SORTABLE = ['issueDate', 'dueDate', 'total', 'status', 'number', 'createdAt'] as const

/** Aggregate-specific filter mirroring the frozen invoices-list query params. */
export interface DocumentFilter {
  type?: DocumentType
  status?: DocumentStatus
  clientId?: string
  search?: string
  dateFrom?: Date
  dateTo?: Date
}

/** Create input with the tenant key removed — `workspaceId` is injected by the repo. */
export type DocumentCreateData = Omit<Prisma.DocumentUncheckedCreateInput, 'workspaceId' | 'items'>

/** A line item to create alongside a document (repo injects `documentId`). */
export type DocumentItemCreateData = Omit<Prisma.DocumentItemUncheckedCreateInput, 'documentId'>

export type DocumentWithItems = Prisma.DocumentGetPayload<{ include: { items: true } }>

export interface DocumentRepositoryContract
  extends ReadRepository<Document, DocumentFilter>,
    SoftDeleteRepository<Document> {
  create(data: DocumentCreateData): Promise<Document>
  createWithItems(data: DocumentCreateData, items: DocumentItemCreateData[]): Promise<DocumentWithItems>
  update(id: string, data: Prisma.DocumentUpdateInput): Promise<Document>
  hardDelete(id: string): Promise<Document>
  listDeleted(filter?: DocumentFilter, pagination?: PaginationInput): Promise<Paginated<Document>>
  listByClient(clientId: string, pagination?: PaginationInput): Promise<Paginated<Document>>
  findByIdWithItems(id: string): Promise<DocumentWithItems | null>
  findOverdue(asOf?: Date): Promise<Document[]>
}

/**
 * Data access for the polymorphic `Document` aggregate (invoices, quotes, receipts,
 * salary slips, POs, …). All reads/writes are tenant-scoped via `TenantRepository`.
 */
export class DocumentRepository extends TenantRepository implements DocumentRepositoryContract {
  private matchers(filter: DocumentFilter = {}): Prisma.DocumentWhereInput {
    const dateRange =
      filter.dateFrom || filter.dateTo
        ? { issueDate: { gte: filter.dateFrom, lte: filter.dateTo } }
        : {}
    return {
      type: filter.type,
      status: filter.status,
      clientId: filter.clientId,
      ...dateRange,
      ...(filter.search
        ? { OR: [{ number: { contains: filter.search, mode: 'insensitive' } }] }
        : {}),
    }
  }

  private where(filter: DocumentFilter = {}): Prisma.DocumentWhereInput {
    return this.activeScope<Prisma.DocumentWhereInput>(this.matchers(filter))
  }

  findById(id: string): Promise<Document | null> {
    return this.run(() =>
      this.db.document.findFirst({ where: this.activeScope<Prisma.DocumentWhereInput>({ id }) }),
    )
  }

  findByIdWithItems(id: string): Promise<DocumentWithItems | null> {
    return this.run(() =>
      this.db.document.findFirst({
        where: this.activeScope<Prisma.DocumentWhereInput>({ id }),
        include: { items: { orderBy: { position: 'asc' } } },
      }),
    )
  }

  async requireById(id: string): Promise<Document> {
    const doc = await this.findById(id)
    if (!doc) throw new NotFoundError('Document', { id })
    return doc
  }

  /**
   * Find a live document carrying `number` in the current workspace.
   *
   * Uses `activeScope`, so the lookup is workspace-scoped (numbers may repeat across
   * workspaces) and ignores soft-deleted documents (a deleted invoice must not reserve its
   * number forever). `excludeId` lets an edit ignore the document being edited.
   */
  findByNumber(number: string, excludeId?: string): Promise<Document | null> {
    return this.run(() =>
      this.db.document.findFirst({
        where: this.activeScope<Prisma.DocumentWhereInput>({
          number,
          ...(excludeId ? { NOT: { id: excludeId } } : {}),
        }),
      }),
    )
  }

  count(filter: DocumentFilter = {}): Promise<number> {
    return this.run(() => this.db.document.count({ where: this.where(filter) }))
  }

  /**
   * Number of invoices this workspace has *created* since `since`. Deliberately includes
   * soft-deleted rows (no `deletedAt` filter) so that deleting an invoice does NOT restore
   * the monthly quota — only successful creation counts (Phase 1 free-access rule).
   */
  countInvoicesCreatedSince(since: Date): Promise<number> {
    return this.run(() =>
      this.db.document.count({
        where: { workspaceId: this.workspaceId, type: 'INVOICE', createdAt: { gte: since } },
      }),
    )
  }

  list(
    filter: DocumentFilter = {},
    pagination?: PaginationInput,
    sort?: SortInput,
  ): Promise<Paginated<Document>> {
    const where = this.where(filter)
    const orderBy = sort ? buildOrderBy(sort) : { issueDate: 'desc' as const }
    return this.paginate(
      pagination,
      () => this.db.document.count({ where }),
      (skip, take) => this.db.document.findMany({ where, orderBy, skip, take }),
    )
  }

  listByClient(clientId: string, pagination?: PaginationInput): Promise<Paginated<Document>> {
    return this.list({ clientId }, pagination)
  }

  create(data: DocumentCreateData): Promise<Document> {
    return this.run(() =>
      this.db.document.create({ data: { ...data, workspaceId: this.workspaceId } }),
    )
  }

  /** Create a document and its line items atomically (single nested insert). */
  createWithItems(
    data: DocumentCreateData,
    items: DocumentItemCreateData[],
  ): Promise<DocumentWithItems> {
    return this.run(() =>
      this.db.document.create({
        data: {
          ...data,
          workspaceId: this.workspaceId,
          items: { create: items },
        },
        include: { items: { orderBy: { position: 'asc' } } },
      }),
    )
  }

  async update(id: string, data: Prisma.DocumentUpdateInput): Promise<Document> {
    await this.requireById(id) // enforce tenant ownership before mutating by unique id
    return this.run(() => this.db.document.update({ where: { id }, data }))
  }

  async softDelete(id: string): Promise<Document> {
    await this.requireById(id)
    return this.run(() => this.db.document.update({ where: { id }, data: { deletedAt: new Date() } }))
  }

  async hardDelete(id: string): Promise<Document> {
    const existing = await this.run(() =>
      this.db.document.findFirst({ where: this.scope<Prisma.DocumentWhereInput>({ id }) }),
    )
    if (!existing) throw new NotFoundError('Document', { id })
    await this.run(() => this.db.document.delete({ where: { id } }))
    return existing
  }

  listDeleted(
    filter: DocumentFilter = {},
    pagination?: PaginationInput,
  ): Promise<Paginated<Document>> {
    const where = this.scope<Prisma.DocumentWhereInput>({
      ...this.matchers(filter),
      deletedAt: { not: null },
    })
    return this.paginate(
      pagination,
      () => this.db.document.count({ where }),
      (skip, take) => this.db.document.findMany({ where, orderBy: { deletedAt: 'desc' }, skip, take }),
    )
  }

  listCursor(filter: DocumentFilter = {}, cursor?: CursorInput): Promise<CursorPage<Document>> {
    const where = this.where(filter)
    return this.cursorPage(cursor, (take, from) =>
      this.db.document.findMany({
        where,
        orderBy: { id: 'desc' },
        take,
        ...(from ? { cursor: { id: from }, skip: 1 } : {}),
      }),
    )
  }

  async restore(id: string): Promise<Document> {
    const res = await this.run(() =>
      this.db.document.updateMany({
        where: this.scope<Prisma.DocumentWhereInput>({ id }),
        data: { deletedAt: null },
      }),
    )
    if (res.count === 0) throw new NotFoundError('Document', { id })
    return this.requireById(id)
  }

  /** Sent invoices past their due date — used by the overdue sweeper (later mission). */
  findOverdue(asOf: Date = new Date()): Promise<Document[]> {
    return this.run(() =>
      this.db.document.findMany({
        where: this.activeScope<Prisma.DocumentWhereInput>({
          type: 'INVOICE',
          status: 'SENT',
          dueDate: { lt: asOf },
        }),
        orderBy: { dueDate: 'asc' },
      }),
    )
  }
}
