import type { Paginated, PaginationInput } from '@/server/db/utils'

/**
 * Repository contracts.
 *
 * Concrete repositories implement the subset of these that make sense for their
 * aggregate. Higher layers (services — later missions) depend on these interfaces,
 * not on the Prisma-backed implementations, keeping the data layer swappable/testable.
 */

export interface ReadRepository<T, Filter = unknown> {
  /** Returns the entity or `null` if not found within scope. */
  findById(id: string): Promise<T | null>
  /** Returns the entity or throws `NotFoundError`. */
  requireById(id: string): Promise<T>
  /** Paginated listing with an optional aggregate-specific filter. */
  list(filter?: Filter, pagination?: PaginationInput): Promise<Paginated<T>>
  /** Count matching rows within scope. */
  count(filter?: Filter): Promise<number>
}

export interface WriteRepository<T, CreateInput, UpdateInput> {
  create(data: CreateInput): Promise<T>
  update(id: string, data: UpdateInput): Promise<T>
}

export interface SoftDeleteRepository<T> {
  /** Marks the row deleted (`deletedAt = now`). */
  softDelete(id: string): Promise<T>
  /** Clears the soft-delete marker. */
  restore(id: string): Promise<T>
}
