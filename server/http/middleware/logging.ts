import type { RequestContext } from '@/server/http/context'

/** Structured request lifecycle logging, correlated by request id. */
export function logRequestStart(ctx: RequestContext): void {
  ctx.logger.info('request.start', { method: ctx.method, path: ctx.path })
}

export function logRequestEnd(ctx: RequestContext, status: number): void {
  const durationMs = Math.round(performance.now() - ctx.startedAt)
  const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info'
  ctx.logger[level]('request.end', { method: ctx.method, path: ctx.path, status, durationMs })
}
