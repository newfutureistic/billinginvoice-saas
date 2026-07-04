import { createLogger, type Logger } from '@/server/db/logger'

/**
 * Logging service — factory for scoped, structured loggers used outside a request
 * context (jobs, startup). Inside a request, prefer `ctx.logger` / `BaseService.logger`.
 */
export function serviceLogger(scope: string, bindings: Record<string, unknown> = {}): Logger {
  return createLogger(`service:${scope}`, bindings)
}

export type { Logger }
