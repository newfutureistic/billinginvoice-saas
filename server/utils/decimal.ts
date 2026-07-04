import { Prisma } from '@prisma/client'

/** A value that may be a Prisma Decimal, number, or numeric string. */
export type DecimalLike = Prisma.Decimal | number | string

/** Convert a Decimal/number/string to a JS number (for DTO output). */
export function decimalToNumber(value: DecimalLike): number {
  if (value instanceof Prisma.Decimal) return value.toNumber()
  return typeof value === 'number' ? value : Number(value)
}

/** Nullable variant. */
export function decimalToNumberOrNull(value: DecimalLike | null | undefined): number | null {
  return value === null || value === undefined ? null : decimalToNumber(value)
}

/** Round to `dp` decimal places using half-up, avoiding binary float drift. */
export function roundTo(value: number, dp = 2): number {
  const factor = 10 ** dp
  return Math.round((value + Number.EPSILON) * factor) / factor
}
