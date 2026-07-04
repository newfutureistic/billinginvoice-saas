/** Sorting utilities: parse a client sort param into a safe Prisma `orderBy`. */

export type SortDirection = 'asc' | 'desc'

export interface SortInput {
  field: string
  direction: SortDirection
}

/**
 * Parse a sort expression (`"date"`, `"-date"`, or `"date:desc"`) against an allow-list.
 * Falls back to `fallback` for unknown/missing fields — clients can never sort by an
 * arbitrary column.
 */
export function parseSort(
  raw: string | undefined,
  allowed: readonly string[],
  fallback: SortInput,
): SortInput {
  if (!raw) return fallback

  let field = raw
  let direction: SortDirection = 'asc'

  if (raw.includes(':')) {
    const [f, d] = raw.split(':', 2)
    field = f
    direction = d === 'desc' ? 'desc' : 'asc'
  } else if (raw.startsWith('-')) {
    field = raw.slice(1)
    direction = 'desc'
  }

  if (!allowed.includes(field)) return fallback
  return { field, direction }
}

/** Build a Prisma-compatible `orderBy` object from a validated {@link SortInput}. */
export function buildOrderBy(sort: SortInput): Record<string, SortDirection> {
  return { [sort.field]: sort.direction }
}
