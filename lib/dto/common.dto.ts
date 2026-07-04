/**
 * DTO layer conventions:
 *  - Input DTO    → the `z.infer<>` types from `lib/validation/*` (what the API accepts).
 *  - Output DTO   → the JSON-safe shapes defined here (what the API returns): Dates become
 *                   ISO strings, Prisma `Decimal` becomes `number`.
 *  - Internal DTO → the Prisma model (row) itself; never returned directly to clients.
 *  - Mappers      → pure `toXDTO(model)` functions converting Internal → Output.
 */

export function iso(date: Date): string {
  return date.toISOString()
}

export function isoOrNull(date: Date | null | undefined): string | null {
  return date ? date.toISOString() : null
}
