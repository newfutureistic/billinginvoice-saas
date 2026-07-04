import { toAppError } from '@/server/errors/error-handler'
import { type AppError } from '@/server/errors/app-error'
import { dbLogger } from '@/server/db/logger'

/**
 * Error service — normalizes and (optionally) logs errors for non-HTTP call sites such
 * as background jobs, where the route handler's automatic error funnel is not present.
 * At the API boundary the route wrapper already calls `toAppError`.
 */
export function normalizeError(err: unknown): AppError {
  return toAppError(err)
}

export function reportError(err: unknown, context: Record<string, unknown> = {}): AppError {
  const appError = toAppError(err)
  const log = dbLogger.child(context)
  if (appError.isInternal) {
    log.error('unhandled.error', { code: appError.code, message: err instanceof Error ? err.message : String(err) })
  } else {
    log.warn('handled.error', { code: appError.code })
  }
  return appError
}
