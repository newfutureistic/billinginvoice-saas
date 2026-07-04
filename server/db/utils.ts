import { prisma } from '@/server/db/prisma'
import { dbLogger } from '@/server/db/logger'

/**
 * Database utilities shared across the data layer: connection health, pagination,
 * and the soft-delete filter convention (`deletedAt IS NULL`).
 */

// --- Health -----------------------------------------------------------------

/** Lightweight connectivity probe. Returns false instead of throwing. */
export async function pingDatabase(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (err) {
    dbLogger.error('Database ping failed', { error: err instanceof Error ? err.message : String(err) })
    return false
  }
}

// --- Pagination -------------------------------------------------------------

export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100

export interface PaginationInput {
  page?: number
  pageSize?: number
}

export interface Pagination {
  page: number
  pageSize: number
  skip: number
  take: number
}

/** Normalize/clamp page + pageSize into Prisma `skip`/`take`. */
export function resolvePagination(input: PaginationInput = {}): Pagination {
  const page = Math.max(1, Math.floor(input.page ?? 1))
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(input.pageSize ?? DEFAULT_PAGE_SIZE)))
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize }
}

export interface PageMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface Paginated<T> {
  data: T[]
  meta: PageMeta
}

export function buildPageMeta(total: number, page: number, pageSize: number): PageMeta {
  const totalPages = pageSize > 0 ? Math.ceil(total / pageSize) : 0
  return {
    page,
    pageSize,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  }
}

// --- Soft delete convention -------------------------------------------------

/** Filter fragment: only rows that are not soft-deleted. */
export const notDeleted = { deletedAt: null } as const

/** Merge the not-deleted filter into an existing `where` object. */
export function withNotDeleted<T extends Record<string, unknown>>(where?: T): T & { deletedAt: null } {
  return { ...(where ?? ({} as T)), deletedAt: null }
}

// --- Identifiers ------------------------------------------------------------

/** True if `value` looks like a Prisma `cuid()` primary key. */
export function isCuid(value: unknown): value is string {
  return typeof value === 'string' && /^c[a-z0-9]{24}$/i.test(value)
}
