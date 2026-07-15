import { PrismaClient, type Prisma } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { getEnv } from '@/server/config/env'
import { dbLogger } from '@/server/db/logger'

/**
 * The executor type shared by repositories and the transaction helper. Both the full
 * client and an interactive transaction client are assignable to it, so a repository
 * can run against `prisma` directly or inside a `$transaction` unchanged.
 */
export type DbClient = Prisma.TransactionClient

/**
 * Prisma Client singleton.
 *
 * Prisma 7 connects through a driver adapter rather than a schema `url`. We use the
 * `@prisma/adapter-pg` adapter over the pooled Supabase connection (`DATABASE_URL`).
 * A single instance is cached on `globalThis` in non-production so Next.js hot-reload
 * does not exhaust the connection pool with a new client per reload.
 *
 * Query/warn/error logs are emitted as events and routed through the structured
 * `dbLogger`; query logging is gated by `PRISMA_LOG_QUERIES`.
 */
function createPrismaClient(): PrismaClient {
  const env = getEnv()

  // Pool configuration tuned for the Supabase transaction pooler. Without these, a connection
  // the pooler has already dropped can hang a query indefinitely (observed: a request stuck for
  // ~71 minutes before P1001). These make a dead/slow connection fail FAST so the retry wrapper
  // (server/db/retry.ts) can grab a fresh one — turning a hard outage into a sub-second recovery.
  const adapter = new PrismaPg({
    connectionString: env.DATABASE_URL,
    max: 10, // pool size for the pooler
    connectionTimeoutMillis: 10_000, // give up acquiring a connection after 10s (don't hang)
    idleTimeoutMillis: 10_000, // evict idle connections before the pooler silently drops them
    keepAlive: true, // TCP keep-alive so dead sockets are detected promptly
    statement_timeout: 20_000, // server-side: kill a query stuck for >20s
    query_timeout: 20_000, // client-side query timeout (belt-and-braces)
  })

  const client = new PrismaClient({
    adapter,
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'event', level: 'warn' },
      { emit: 'event', level: 'error' },
    ],
  })

  client.$on('query', (e) => {
    if (env.PRISMA_LOG_QUERIES) {
      dbLogger.debug('query', { durationMs: e.duration, query: e.query })
    }
  })
  client.$on('warn', (e) => dbLogger.warn(e.message))
  client.$on('error', (e) => dbLogger.error(e.message))

  dbLogger.info('Prisma client initialized', { adapter: 'pg' })
  return client
}

type PrismaSingleton = ReturnType<typeof createPrismaClient>

const globalForPrisma = globalThis as unknown as { __billmakerPrisma?: PrismaSingleton }

export const prisma: PrismaSingleton = globalForPrisma.__billmakerPrisma ?? createPrismaClient()

if (getEnv().NODE_ENV !== 'production') {
  globalForPrisma.__billmakerPrisma = prisma
}

/** Gracefully close the connection pool (scripts, tests, graceful shutdown). */
export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect()
  dbLogger.info('Prisma client disconnected')
}
