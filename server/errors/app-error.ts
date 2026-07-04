import { ErrorCode } from '@/server/errors/error-codes'
import { HttpStatus } from '@/server/errors/http-status'

/** Per-field validation messages, keyed by dotted field path (RHF-compatible). */
export type FieldErrors = Record<string, string>

export interface AppErrorOptions {
  code?: ErrorCode
  httpStatus?: HttpStatus
  /** Structured, safe-to-expose detail. */
  details?: unknown
  /** Field-level validation errors. */
  fields?: FieldErrors
  /** Underlying cause (never serialized to clients). */
  cause?: unknown
  /** Whether `message` is safe to show to clients. Server errors default to false. */
  expose?: boolean
}

/**
 * Application error — the single currency of failure across the service and API layers.
 * Every error that reaches the API boundary is normalized to an `AppError` (see
 * `error-handler.ts`) and then formatted into the standard error envelope.
 */
export class AppError extends Error {
  readonly code: ErrorCode
  readonly httpStatus: HttpStatus
  readonly details?: unknown
  readonly fields?: FieldErrors
  readonly expose: boolean

  constructor(message: string, options: AppErrorOptions = {}) {
    super(message)
    this.name = new.target.name
    this.code = options.code ?? ErrorCode.INTERNAL_ERROR
    this.httpStatus = options.httpStatus ?? HttpStatus.INTERNAL_SERVER_ERROR
    this.details = options.details
    this.fields = options.fields
    this.expose = options.expose ?? this.httpStatus < 500
    if (options.cause !== undefined) this.cause = options.cause
    Error.captureStackTrace?.(this, new.target)
  }

  /** True for 5xx — used by the handler to decide whether to hide the message. */
  get isInternal(): boolean {
    return this.httpStatus >= 500
  }
}

// --- 4xx ---------------------------------------------------------------------

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', fields?: FieldErrors, details?: unknown) {
    super(message, {
      code: ErrorCode.VALIDATION_ERROR,
      httpStatus: HttpStatus.UNPROCESSABLE_ENTITY,
      fields,
      details,
      expose: true,
    })
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request', details?: unknown) {
    super(message, { code: ErrorCode.BAD_REQUEST, httpStatus: HttpStatus.BAD_REQUEST, details, expose: true })
  }
}

export class UnauthenticatedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, { code: ErrorCode.UNAUTHENTICATED, httpStatus: HttpStatus.UNAUTHORIZED, expose: true })
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'You do not have permission to perform this action', details?: unknown) {
    super(message, { code: ErrorCode.FORBIDDEN, httpStatus: HttpStatus.FORBIDDEN, details, expose: true })
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', details?: unknown) {
    super(message, { code: ErrorCode.NOT_FOUND, httpStatus: HttpStatus.NOT_FOUND, details, expose: true })
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict', details?: unknown) {
    super(message, { code: ErrorCode.CONFLICT, httpStatus: HttpStatus.CONFLICT, details, expose: true })
  }
}

export class BusinessError extends AppError {
  constructor(message: string, options: { code?: ErrorCode; details?: unknown } = {}) {
    super(message, {
      code: options.code ?? ErrorCode.BUSINESS_RULE_VIOLATION,
      httpStatus: HttpStatus.UNPROCESSABLE_ENTITY,
      details: options.details,
      expose: true,
    })
  }
}

export class RateLimitError extends AppError {
  readonly retryAfterSeconds?: number
  constructor(message = 'Too many requests', retryAfterSeconds?: number) {
    super(message, {
      code: ErrorCode.RATE_LIMITED,
      httpStatus: HttpStatus.TOO_MANY_REQUESTS,
      details: retryAfterSeconds ? { retryAfterSeconds } : undefined,
      expose: true,
    })
    this.retryAfterSeconds = retryAfterSeconds
  }
}

export class TenantRequiredError extends AppError {
  constructor(message = 'A workspace context is required for this request') {
    super(message, { code: ErrorCode.TENANT_REQUIRED, httpStatus: HttpStatus.BAD_REQUEST, expose: true })
  }
}

// --- 5xx ---------------------------------------------------------------------

export class InternalError extends AppError {
  constructor(message = 'Internal server error', options: { cause?: unknown; details?: unknown } = {}) {
    super(message, {
      code: ErrorCode.INTERNAL_ERROR,
      httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
      cause: options.cause,
      details: options.details,
      expose: false,
    })
  }
}

export class NotImplementedError extends AppError {
  constructor(message = 'Not implemented') {
    super(message, { code: ErrorCode.NOT_IMPLEMENTED, httpStatus: HttpStatus.NOT_IMPLEMENTED, expose: true })
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message = 'Service temporarily unavailable', options: { cause?: unknown } = {}) {
    super(message, {
      code: ErrorCode.SERVICE_UNAVAILABLE,
      httpStatus: HttpStatus.SERVICE_UNAVAILABLE,
      cause: options.cause,
      expose: true,
    })
  }
}

export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError
}
