import type { PageMeta, Paginated } from '@/server/db/utils'
import type { AppError, FieldErrors } from '@/server/errors/app-error'

/**
 * The single response envelope for every endpoint. Success and error responses share
 * `success` (discriminant) and `meta`, so clients handle any response uniformly.
 *
 * ONE format rule: the payload is always `data`. List endpoints put their array and
 * pagination *inside* data as a {@link ListResult} (`data.items` + `data.pagination`) —
 * there is no separate "list envelope".
 *
 * Builders are pure (no `next/server` dependency) so they are unit-testable and reused
 * by the route wrapper, which wraps the body in a `NextResponse`.
 */

export interface ApiMeta {
  requestId: string
  timestamp: string
}

export interface ApiSuccess<T> {
  success: true
  data: T
  meta: ApiMeta
}

export interface ApiErrorBody {
  success: false
  error: {
    code: string
    message: string
    fields?: FieldErrors
    details?: unknown
  }
  meta: ApiMeta
}

export type ApiResponse<T> = ApiSuccess<T> | ApiErrorBody

/** List payload shape carried inside `data`. */
export interface ListResult<T> {
  items: T[]
  pagination: PageMeta
}

function meta(requestId: string): ApiMeta {
  return { requestId, timestamp: new Date().toISOString() }
}

export function successBody<T>(data: T, opts: { requestId: string }): ApiSuccess<T> {
  return { success: true, data, meta: meta(opts.requestId) }
}

export function errorBody(err: AppError, opts: { requestId: string }): ApiErrorBody {
  // Internal (5xx) errors never leak their message or details to clients.
  const safe = err.expose
  return {
    success: false,
    error: {
      code: err.code,
      message: safe ? err.message : 'Internal server error',
      ...(safe && err.fields ? { fields: err.fields } : {}),
      ...(safe && err.details !== undefined ? { details: err.details } : {}),
    },
    meta: meta(opts.requestId),
  }
}

/** Convert a repository `Paginated<T>` into the API `ListResult` payload. */
export function toListResult<T>(page: Paginated<T>): ListResult<T> {
  return { items: page.data, pagination: page.meta }
}

/** Convert a mapped array into a `ListResult` from a source `Paginated`. */
export function mapListResult<S, T>(page: Paginated<S>, map: (item: S) => T): ListResult<T> {
  return { items: page.data.map(map), pagination: page.meta }
}
