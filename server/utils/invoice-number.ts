/**
 * Invoice/document number formatting utilities. Pure string helpers only — the
 * gap-free sequence *allocation* is a DB-backed service (`DocumentSequence`), delivered
 * with the invoice engine. These format/parse the number given its parts.
 */

export interface NumberParts {
  prefix: string
  period: string
  sequence: number
  padding: number
}

/** Format parts into a document number, e.g. `{prefix:'INV',period:'2024',sequence:1}` → `INV-2024-001`. */
export function formatDocumentNumber(parts: NumberParts): string {
  const seq = String(parts.sequence).padStart(parts.padding, '0')
  return [parts.prefix, parts.period, seq].filter(Boolean).join('-')
}

/**
 * Render a `WorkspaceSettings.numberFormat` template such as `INV-{YYYY}-{SEQ}`.
 * Supported tokens: `{YYYY}`, `{YY}`, `{MM}`, `{SEQ}` (zero-padded by `padding`).
 */
export function renderNumberFormat(
  template: string,
  opts: { sequence: number; date?: Date; padding?: number },
): string {
  const date = opts.date ?? new Date()
  const yyyy = String(date.getUTCFullYear())
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0')
  return template
    .replace(/\{YYYY\}/g, yyyy)
    .replace(/\{YY\}/g, yyyy.slice(-2))
    .replace(/\{MM\}/g, mm)
    .replace(/\{SEQ\}/g, String(opts.sequence).padStart(opts.padding ?? 3, '0'))
}

/** Parse a `PREFIX-PERIOD-SEQ` number back into parts (best effort). */
export function parseDocumentNumber(value: string): NumberParts | null {
  const match = /^([A-Za-z]+)-(\d{2,4})-(\d+)$/.exec(value)
  if (!match) return null
  return {
    prefix: match[1],
    period: match[2],
    sequence: Number(match[3]),
    padding: match[3].length,
  }
}
