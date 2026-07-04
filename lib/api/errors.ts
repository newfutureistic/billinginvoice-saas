/**
 * Client-side API error + envelope types.
 *
 * These mirror the server's response envelope (`server/http/response.ts`) as *shapes only*
 * — no business logic is duplicated. The single fetch implementation in `http.ts` unwraps
 * the envelope and throws {@link ApiError} on failure, so every hook handles errors uniformly.
 */
export interface FieldErrors {
  [field: string]: string
}

export interface ApiErrorPayload {
  code: string
  message: string
  fields?: FieldErrors
  details?: unknown
}

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
  error: ApiErrorPayload
  meta: ApiMeta
}

export type ApiResponse<T> = ApiSuccess<T> | ApiErrorBody

/** Pagination metadata carried inside list responses. */
export interface PageMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

/** The shape every list endpoint returns inside `data`. */
export interface ListResult<T> {
  items: T[]
  pagination: PageMeta
}

/** A typed error thrown by the API client — carries the server's stable `code`. */
export class ApiError extends Error {
  readonly code: string
  readonly status: number
  readonly fields?: FieldErrors
  readonly details?: unknown

  constructor(payload: ApiErrorPayload, status: number) {
    super(payload.message)
    this.name = 'ApiError'
    this.code = payload.code
    this.status = status
    this.fields = payload.fields
    this.details = payload.details
  }

  get isUnauthenticated(): boolean {
    return this.status === 401 || this.code === 'UNAUTHENTICATED'
  }
  get isForbidden(): boolean {
    return this.status === 403 || this.code === 'FORBIDDEN'
  }
  get isNotFound(): boolean {
    return this.status === 404 || this.code === 'NOT_FOUND'
  }
  get isValidation(): boolean {
    return this.status === 422 || this.code === 'VALIDATION_ERROR'
  }
  get isRateLimited(): boolean {
    return this.status === 429 || this.code === 'RATE_LIMITED'
  }
}
