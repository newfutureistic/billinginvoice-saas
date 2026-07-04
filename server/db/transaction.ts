import { Prisma } from '@prisma/client'
import { prisma, type DbClient } from '@/server/db/prisma'
import { mapPrismaError } from '@/server/db/errors'
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

/** Prisma error codes worth retrying (transient write conflicts / deadlocks). */
const RETRYABLE_CODES = new Set(['P2034'])

/**
 * Run `fn` inside a single interactive transaction. All repository work performed with
 * the provided `tx` commits atomically or rolls back together.
 */
export async function runInTransaction<T>(
  fn: (tx: DbClient) => Promise<T>,
  options: TransactionOptions = {},
): Promise<T> {
  const { retries = 2, ...txOptions } = options

  for (let attempt = 0; ; attempt++) {
    try {
      return await prisma.$transaction(fn, txOptions)
    } catch (err) {
      const retryable =
        err instanceof Prisma.PrismaClientKnownRequestError && RETRYABLE_CODES.has(err.code)

      if (retryable && attempt < retries) {
        dbLogger.warn('Retrying transaction after write conflict', {
          attempt: attempt + 1,
          prismaCode: err.code,
        })
        continue
      }
      throw mapPrismaError(err)
    }
  }
}
