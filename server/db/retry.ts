/**
 * Transient-error retry for database operations.
 *
 * The app runs on a pooled Supabase connection whose free-tier pooler occasionally drops or
 * refuses a connection (`P1001` "Can't reach database server", ECONNRESET, "server has closed
 * the connection", …). These are *transient*: the very next attempt acquires a fresh pooled
 * connection and succeeds. This wrapper retries only those errors with a short exponential
 * backoff so a brief blip is invisible to the user, and re-throws real errors immediately
 * (e.g. a validation or not-found error must not be retried). It never changes behavior for a
 * healthy database — the first attempt returns.
 */

const TRANSIENT_PRISMA_CODES = new Set(['P1001', 'P1002', 'P1008', 'P1017'])

export function isTransientDbError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false
  const e = err as { code?: string; message?: string; name?: string }
  if (e.code && TRANSIENT_PRISMA_CODES.has(e.code)) return true
  if (e.name === 'PrismaClientInitializationError') return true
  const m = (e.message || '').toLowerCase()
  return (
    m.includes("can't reach database") ||
    m.includes('cannot reach database') ||
    m.includes('server has closed the connection') ||
    m.includes('connection terminated') ||
    m.includes('connection closed') ||
    m.includes('connection reset') ||
    m.includes('econnreset') ||
    m.includes('econnrefused') ||
    m.includes('etimedout') ||
    m.includes('timed out') ||
    m.includes('too many connections')
  )
}

/**
 * Run `op`, retrying transient database errors up to `attempts` times (~1s total by default).
 * Non-transient errors and the final failure propagate unchanged.
 */
export async function withDbRetry<T>(op: () => Promise<T>, attempts = 4): Promise<T> {
  let lastErr: unknown
  for (let i = 0; i < attempts; i++) {
    try {
      return await op()
    } catch (err) {
      lastErr = err
      if (i === attempts - 1 || !isTransientDbError(err)) throw err
      await new Promise((resolve) => setTimeout(resolve, Math.min(150 * 2 ** i, 1200)))
    }
  }
  throw lastErr
}
