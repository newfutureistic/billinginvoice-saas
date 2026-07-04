import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'
import {
  DatabaseError,
  mapPrismaError,
  type DatabaseErrorCode,
} from '@/server/db/errors'
import {
  AppError,
  BadRequestError,
  ConflictError,
  InternalError,
  NotFoundError,
  ServiceUnavailableError,
  ValidationError,
  type FieldErrors,
} from '@/server/errors/app-error'

/**
 * Global error normalizer. Every error that reaches the API boundary passes through
 * `toAppError`, which guarantees a typed {@link AppError} with a safe HTTP status and
 * stable code. Unknown/internal errors are collapsed to a generic 500 that never leaks
 * implementation detail.
 */

/** Build field errors from a ZodError (dotted paths → messages). */
export function fieldErrorsFromZod(err: ZodError): FieldErrors {
  const fields: FieldErrors = {}
  for (const issue of err.issues) {
    const path = issue.path.map((p) => String(p)).join('.') || '(root)'
    if (!(path in fields)) fields[path] = issue.message
  }
  return fields
}

export function validationErrorFromZod(err: ZodError): ValidationError {
  return new ValidationError('Validation failed', fieldErrorsFromZod(err))
}

/** Map a data-layer {@link DatabaseError} to the corresponding API {@link AppError}. */
export function appErrorFromDatabaseError(err: DatabaseError): AppError {
  const code: DatabaseErrorCode = err.code
  switch (code) {
    case 'NOT_FOUND':
      return new NotFoundError(err.message, err.meta)
    case 'UNIQUE_VIOLATION':
      return new ConflictError('A record with these values already exists', err.meta)
    case 'FOREIGN_KEY_VIOLATION':
      return new BadRequestError('Referenced record does not exist', err.meta)
    case 'NULL_VIOLATION':
    case 'VALUE_TOO_LONG':
    case 'VALIDATION':
      return new BadRequestError(err.message, err.meta)
    case 'CONNECTION':
      return new ServiceUnavailableError('Database is temporarily unavailable', { cause: err })
    case 'TRANSACTION':
    case 'UNKNOWN':
    default:
      return new InternalError('A database error occurred', { cause: err })
  }
}

/** Normalize any thrown value into an {@link AppError}. */
export function toAppError(err: unknown): AppError {
  if (err instanceof AppError) return err
  if (err instanceof ZodError) return validationErrorFromZod(err)
  if (err instanceof DatabaseError) return appErrorFromDatabaseError(err)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    return appErrorFromDatabaseError(mapPrismaError(err))
  }
  if (err instanceof Prisma.PrismaClientValidationError) {
    return new BadRequestError('Invalid database query')
  }
  return new InternalError('Internal server error', { cause: err })
}
