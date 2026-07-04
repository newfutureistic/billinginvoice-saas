import { defineConfig } from 'prisma/config'

/**
 * Prisma 7 configuration.
 *
 * In Prisma 7 the connection URL is no longer allowed in `schema.prisma`. The CLI
 * (migrate / introspect / diff) reads it here; the runtime PrismaClient connects via
 * a driver adapter (see `server/db/prisma.ts`).
 *
 * `DIRECT_URL` is the non-pooled Supabase connection (:5432) required by Migrate.
 * A missing value is tolerated so offline commands (`generate`, `migrate diff
 * --from-empty`) still run without real credentials.
 */
export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? '',
  },
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
})
