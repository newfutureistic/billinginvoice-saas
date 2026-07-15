import { Prisma } from '@prisma/client'
import { prisma, type DbClient } from '@/server/db/prisma'
import { mapPrismaError } from '@/server/db/errors'
import { isTransientDbError } from '@/server/db/retry'
import { dbLogger } from '@/server/db/logger'

/**
 * Transaction helper.
 *
 * Wraps Prisma interactive transactions with:
 *  - typed executor (`DbClient`) so repositories run unchanged inside a transaction,
 *  - automatic retry on write-conflict / deadlock (Prisma `P2034`),
 *  - error normalization via `mapPrismaError`.
 */

export type { DbClient }
export type TransactionClient = Prisma.TransactionClient

export interface TransactionOptions {
  /** Max time (ms) to wait to acquire a transaction from the pool. */
  maxWait?: number
  /** Max time (ms) the interactive transaction may run. */
  timeout?: number
  /** Postgres isolation level. */
  isolationLevel?: Prisma.TransactionIsolationLevel
  /** Number of retries on a retryable write conflict. Default 2. */
  retries?: number
}

/**
 * Prisma error codes worth retrying. A failed interactive transaction always rolls back
 * (nothing was committed), so re-running it on a fresh connection is safe:
 *  - `P2034` — write conflict / deadlock (the classic retryable).
 *  - `P2028` — transaction API error, e.g. the transaction timed out or was closed after the
 *    pooled connection stalled (a transient Supabase pooler blip). Retrying acquires a fresh
 *    connection and typically succeeds instead of surfacing a 500 to the user.
 *  - `P2024` — timed out fetching a connection from the pool (transient pool pressure).
 */
const RETRYABLE_CODES = new Set(['P2034', 'P2028', 'P2024'])

/**
 * Default bounds for interactive transactions. Normal document writes finish in well under a
 * second; these ceilings simply stop a stalled pooled connection from hanging the request
 * open-endedly before the retry above can kick in. Callers may override per-call.
 */
const DEFAULT_TX_OPTIONS = { maxWait: 6_000, timeout: 15_000 } as const

/**
 * Run `fn` inside a single interactive transaction. All repository work performed with
 * the provided `tx` commits atomically or rolls back together.
 */
export async function runInTransaction<T>(
  fn: (tx: DbClient) => Promise<T>,
  options: TransactionOptions = {},
): Promise<T> {
  const { retries = 2, ...txOptions } = options
  const resolvedOptions = { ...DEFAULT_TX_OPTIONS, ...txOptions }

  for (let attempt = 0; ; attempt++) {
    try {
      return await prisma.$transaction(fn, resolvedOptions)
    } catch (err) {
      // Retry on write-conflicts/deadlocks AND on a transient connection blip (a rolled-back
      // transaction is safe to re-run — the pool reconnects on the next attempt).
      const retryableCode =
        err instanceof Prisma.PrismaClientKnownRequestError && RETRYABLE_CODES.has(err.code)
          ? err.code
          : null
      const transient = isTransientDbError(err)

      if ((retryableCode || transient) && attempt < retries) {
        dbLogger.warn('Retrying transaction', {
          attempt: attempt + 1,
          reason: retryableCode ?? 'transient-connection',
        })
        // Back off before re-acquiring a connection for connection blips and pool/timeout
        // codes (a fresh connection needs a moment); write-conflicts can retry immediately.
        if (transient || retryableCode === 'P2028' || retryableCode === 'P2024') {
          await new Promise((r) => setTimeout(r, Math.min(150 * 2 ** attempt, 800)))
        }
        continue
      }
      throw mapPrismaError(err)
    }
  }
}
