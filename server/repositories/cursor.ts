/**
 * Cursor (keyset) pagination types — offered alongside offset pagination for large,
 * append-only lists where deep offsets are expensive. The cursor is an opaque row id;
 * clients pass the previous page's `nextCursor` to fetch the next page.
 */
export interface CursorInput {
  cursor?: string
  limit?: number
}

export interface CursorPage<T> {
  items: T[]
  nextCursor: string | null
  hasMore: boolean
}

export const DEFAULT_CURSOR_LIMIT = 20
export const MAX_CURSOR_LIMIT = 100

export function resolveCursorLimit(limit?: number): number {
  if (!limit || !Number.isFinite(limit)) return DEFAULT_CURSOR_LIMIT
  return Math.min(MAX_CURSOR_LIMIT, Math.max(1, Math.floor(limit)))
}
