/** Search helpers that build Prisma `where` fragments for case-insensitive matching. */

export function normalizeSearch(term: string | undefined | null): string | undefined {
  const trimmed = term?.trim()
  return trimmed ? trimmed : undefined
}

/** A single case-insensitive `contains` fragment for one field. */
export function containsInsensitive(value: string): { contains: string; mode: 'insensitive' } {
  return { contains: value, mode: 'insensitive' }
}

/**
 * Build an `OR` fragment matching `term` across several string fields, or `undefined`
 * when there is no term (so it can be spread into a `where` without adding noise).
 */
export function buildSearchOr(
  term: string | undefined | null,
  fields: readonly string[],
): { OR: Array<Record<string, { contains: string; mode: 'insensitive' }>> } | undefined {
  const value = normalizeSearch(term)
  if (!value || fields.length === 0) return undefined
  return { OR: fields.map((field) => ({ [field]: containsInsensitive(value) })) }
}
