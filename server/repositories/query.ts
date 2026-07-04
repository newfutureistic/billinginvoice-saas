import type { PaginationInput } from '@/server/db/utils'
import { buildOrderBy, parseSort, type SortDirection, type SortInput } from '@/server/utils/sort'

/**
 * Reusable query options for list endpoints — pagination + validated sort. Filtering is
 * expressed per-aggregate as typed filter objects on each repository. Together these
 * give every list the same shape: filter + sort + paginate + soft-delete-aware.
 */
export interface ListOptions {
  pagination?: PaginationInput
  sort?: SortInput
}

export const DEFAULT_SORT: SortInput = { field: 'createdAt', direction: 'desc' }

/** Resolve a raw sort string to a Prisma `orderBy`, constrained to an allow-list. */
export function resolveOrderBy(
  raw: string | undefined,
  allowed: readonly string[],
  fallback: SortInput = DEFAULT_SORT,
): Record<string, SortDirection> {
  return buildOrderBy(parseSort(raw, allowed, fallback))
}

export type { SortInput, SortDirection }
