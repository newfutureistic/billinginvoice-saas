import { prisma, type DbClient } from '@/server/db/prisma'
import { mapPrismaError } from '@/server/db/errors'
import {
  buildPageMeta,
  resolvePagination,
  type Paginated,
  type PaginationInput,
} from '@/server/db/utils'
import { resolveCursorLimit, type CursorInput, type CursorPage } from '@/server/repositories/cursor'

/**
 * Base repository.
 *
 * All repositories access the database only through `this.db`, which is a `DbClient`
 * (the full client, or a transaction client when constructed inside `runInTransaction`).
 * `run()` funnels every Prisma call through `mapPrismaError`, so repositories never leak
 * raw Prisma errors. `paginate()` standardizes offset pagination.
 */
export abstract class BaseRepository {
  constructor(protected readonly db: DbClient = prisma) {}

  /** Execute a Prisma operation, normalizing any thrown error to a `DatabaseError`. */
  protected async run<T>(op: () => Promise<T>): Promise<T> {
    try {
      return await op()
    } catch (err) {
      throw mapPrismaError(err)
    }
  }

  /** Standard offset pagination: runs count + page query together. */
  protected paginate<T>(
    pagination: PaginationInput | undefined,
    counter: () => Promise<number>,
    finder: (skip: number, take: number) => Promise<T[]>,
  ): Promise<Paginated<T>> {
    const { page, pageSize, skip, take } = resolvePagination(pagination)
    return this.run(async () => {
      const [total, data] = await Promise.all([counter(), finder(skip, take)])
      return { data, meta: buildPageMeta(total, page, pageSize) }
    })
  }

  /**
   * Cursor (keyset) pagination. `finder` receives `take` (limit + 1, to detect a next
   * page) and an optional cursor row id; it must apply `cursor`/`skip:1` and a stable
   * `orderBy`. Returns the trimmed page plus the id to resume from.
   */
  protected cursorPage<T extends { id: string }>(
    input: CursorInput | undefined,
    finder: (take: number, cursor?: string) => Promise<T[]>,
  ): Promise<CursorPage<T>> {
    const limit = resolveCursorLimit(input?.limit)
    return this.run(async () => {
      const rows = await finder(limit + 1, input?.cursor)
      const hasMore = rows.length > limit
      const items = hasMore ? rows.slice(0, limit) : rows
      const nextCursor = hasMore ? (items[items.length - 1]?.id ?? null) : null
      return { items, nextCursor, hasMore }
    })
  }
}
