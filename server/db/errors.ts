import { Prisma } from '@prisma/client'

/**
 * Data-layer error handling.
 *
 * Repositories throw these typed errors instead of leaking raw Prisma errors upward,
 * so higher layers (services / API — later missions) can branch on a stable `code`
 * without importing Prisma internals. `mapPrismaError` translates the Prisma error
 * codes we care about; everything else becomes a generic `DatabaseError`.
 */

export type DatabaseErrorCode =
  | 'NOT_FOUND'
  | 'UNIQUE_VIOLATION'
  | 'FOREIGN_KEY_VIOLATION'
  | 'NULL_VIOLATION'
  | 'VALUE_TOO_LONG'
  | 'VALIDATION'
  | 'CONNECTION'
  | 'TRANSACTION'
  | 'UNKNOWN'

export class DatabaseError extends Error {
  readonly code: DatabaseErrorCode
  /** Safe, non-sensitive detail (e.g. the fields that violated a constraint). */
  readonly meta?: Record<string, unknown>
  /** Original Prisma error code (e.g. "P2002") when available. */
  readonly prismaCode?: string

  constructor(
    message: string,
    code: DatabaseErrorCode = 'UNKNOWN',
    options: { cause?: unknown; meta?: Record<string, unknown>; prismaCode?: string } = {},
  ) {
    super(message)
    this.name = new.target.name
    this.code = code
    this.meta = options.meta
    this.prismaCode = options.prismaCode
    if (options.cause !== undefined) this.cause = options.cause
    Error.captureStackTrace?.(this, new.target)
  }
}

export class NotFoundError extends DatabaseError {
  constructor(entity: string, meta?: Record<string, unknown>) {
    super(`${entity} not found`, 'NOT_FOUND', { meta })
  }
}

export class UniqueConstraintError extends DatabaseError {
  constructor(target: string[] | string | undefined, cause?: unknown) {
    const fields = Array.isArray(target) ? target.join(', ') : target
    super(
      fields ? `Unique constraint failed on: ${fields}` : 'Unique constraint failed',
      'UNIQUE_VIOLATION',
      { cause, meta: { target }, prismaCode: 'P2002' },
    )
  }
}

export class ForeignKeyError extends DatabaseError {
  constructor(field: string | undefined, cause?: unknown) {
    super(
      field ? `Foreign key constraint failed on: ${field}` : 'Foreign key constraint failed',
      'FOREIGN_KEY_VIOLATION',
      { cause, meta: { field }, prismaCode: 'P2003' },
    )
  }
}

export class TransactionError extends DatabaseError {
  constructor(message: string, cause?: unknown) {
    super(message, 'TRANSACTION', { cause })
  }
}

export class ConnectionError extends DatabaseError {
  constructor(message: string, cause?: unknown) {
    super(message, 'CONNECTION', { cause })
  }
}

export function isDatabaseError(err: unknown): err is DatabaseError {
  return err instanceof DatabaseError
}

/**
 * Translate a raw error thrown by Prisma into a typed {@link DatabaseError}.
 * Unknown errors are wrapped as `UNKNOWN` so nothing raw escapes the data layer.
 */
export function mapPrismaError(err: unknown): DatabaseError {
  if (err instanceof DatabaseError) return err

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const meta = err.meta ?? {}
    switch (err.code) {
      case 'P2002':
        return new UniqueConstraintError(meta.target as string[] | string | undefined, err)
      case 'P2003':
        return new ForeignKeyError(meta.field_name as string | undefined, err)
      case 'P2025':
        return new DatabaseError(
          (meta.cause as string) || 'Record not found',
          'NOT_FOUND',
          { cause: err, prismaCode: 'P2025' },
        )
      case 'P2011':
        return new DatabaseError('Null constraint violation', 'NULL_VIOLATION', {
          cause: err,
          meta,
          prismaCode: 'P2011',
        })
      case 'P2000':
        return new DatabaseError('Value too long for column', 'VALUE_TOO_LONG', {
          cause: err,
          meta,
          prismaCode: 'P2000',
        })
      default:
        return new DatabaseError(`Database request failed (${err.code})`, 'UNKNOWN', {
          cause: err,
          prismaCode: err.code,
        })
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return new DatabaseError('Invalid query: validation failed', 'VALIDATION', { cause: err })
  }

  if (err instanceof Prisma.PrismaClientInitializationError) {
    return new ConnectionError('Failed to initialize database connection', err)
  }

  return new DatabaseError(err instanceof Error ? err.message : 'Unknown database error', 'UNKNOWN', {
    cause: err,
  })
}
