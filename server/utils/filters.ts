/** Generic helpers to turn raw query params into typed, safe filter values. */

/** Drop keys whose value is `undefined` (so they don't appear in a Prisma `where`). */
export function pruneUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Partial<T> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) out[key as keyof T] = value as T[keyof T]
  }
  return out
}

/** Coerce a query string to boolean (`"true"`/`"1"` → true), else undefined. */
export function parseBoolean(value: string | undefined | null): boolean | undefined {
  if (value === undefined || value === null || value === '') return undefined
  if (value === 'true' || value === '1') return true
  if (value === 'false' || value === '0') return false
  return undefined
}

/** Return `value` only if it is one of `allowed`, else undefined. */
export function parseEnumParam<T extends string>(
  value: string | undefined | null,
  allowed: readonly T[],
): T | undefined {
  if (!value) return undefined
  return (allowed as readonly string[]).includes(value) ? (value as T) : undefined
}

/** Parse a positive integer query param within [min, max]. */
export function parseIntParam(
  value: string | undefined | null,
  opts: { min?: number; max?: number } = {},
): number | undefined {
  if (value === undefined || value === null || value === '') return undefined
  const n = Number(value)
  if (!Number.isInteger(n)) return undefined
  if (opts.min !== undefined && n < opts.min) return opts.min
  if (opts.max !== undefined && n > opts.max) return opts.max
  return n
}
