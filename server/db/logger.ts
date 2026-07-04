/**
 * Minimal structured logger for the data layer.
 *
 * Deliberately dependency-free (no pino/winston) to keep the database foundation
 * self-contained. Emits single-line JSON in production (log-aggregator friendly) and
 * a compact human-readable line in development. Never logs secrets or full row data —
 * callers pass small, safe context objects.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const LEVEL_ORDER: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 }

type LogContext = Record<string, unknown>

export interface Logger {
  debug(msg: string, ctx?: LogContext): void
  info(msg: string, ctx?: LogContext): void
  warn(msg: string, ctx?: LogContext): void
  error(msg: string, ctx?: LogContext): void
  child(bindings: LogContext): Logger
}

function threshold(): LogLevel {
  const fromEnv = process.env.LOG_LEVEL as LogLevel | undefined
  if (fromEnv && fromEnv in LEVEL_ORDER) return fromEnv
  return process.env.NODE_ENV === 'production' ? 'info' : 'debug'
}

function emit(level: LogLevel, scope: string, msg: string, base: LogContext, ctx?: LogContext): void {
  if (LEVEL_ORDER[level] < LEVEL_ORDER[threshold()]) return
  const record = { level, scope, msg, ...base, ...ctx, time: new Date().toISOString() }

  if (process.env.NODE_ENV === 'production') {
    const line = JSON.stringify(record)
    if (level === 'error') console.error(line)
    else if (level === 'warn') console.warn(line)
    else console.log(line)
    return
  }

  const extra = { ...base, ...ctx }
  const suffix = Object.keys(extra).length ? ` ${JSON.stringify(extra)}` : ''
  const line = `[${level.toUpperCase()}] (${scope}) ${msg}${suffix}`
  if (level === 'error') console.error(line)
  else if (level === 'warn') console.warn(line)
  else if (level === 'debug') console.debug(line)
  else console.log(line)
}

export function createLogger(scope: string, base: LogContext = {}): Logger {
  return {
    debug: (msg, ctx) => emit('debug', scope, msg, base, ctx),
    info: (msg, ctx) => emit('info', scope, msg, base, ctx),
    warn: (msg, ctx) => emit('warn', scope, msg, base, ctx),
    error: (msg, ctx) => emit('error', scope, msg, base, ctx),
    child: (bindings) => createLogger(scope, { ...base, ...bindings }),
  }
}

/** Root logger for the database subsystem. */
export const dbLogger = createLogger('db')
