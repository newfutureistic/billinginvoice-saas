/**
 * Date utilities. Pure, timezone-explicit helpers used by services (e.g. due-date and
 * overdue logic). All persistence is UTC `Date`; formatting is presentation-only.
 */

export function toIso(date: Date): string {
  return date.toISOString()
}

/** Parse an ISO string to a Date, or throw if invalid. */
export function parseIso(value: string): Date {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) throw new Error(`Invalid date: ${value}`)
  return date
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setUTCDate(next.getUTCDate() + days)
  return next
}

export function startOfDayUtc(date: Date): Date {
  const d = new Date(date)
  d.setUTCHours(0, 0, 0, 0)
  return d
}

/** Whole days between two dates (b - a), truncated. */
export function daysBetween(a: Date, b: Date): number {
  const ms = startOfDayUtc(b).getTime() - startOfDayUtc(a).getTime()
  return Math.trunc(ms / 86_400_000)
}

/** True if `dueDate` is strictly before `asOf` (default now). */
export function isPastDue(dueDate: Date, asOf: Date = new Date()): boolean {
  return dueDate.getTime() < asOf.getTime()
}

/** YYYY-MM-DD in UTC (matches the frozen mock date format). */
export function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10)
}
