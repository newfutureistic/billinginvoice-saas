import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
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

// Prisma 7's CLI does not auto-load `.env` when a `prisma.config.ts` is present, so we
// load it ourselves (dependency-free, never overriding vars already in the environment)
// to make DIRECT_URL/DATABASE_URL available to Migrate/introspect.
for (const file of ['.env.local', '.env']) {
  const path = resolve(process.cwd(), file)
  if (!existsSync(path)) continue
  for (const rawLine of readFileSync(path, 'utf8').split('\n')) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq === -1) continue
    const key = line.slice(0, eq).trim()
    if (key in process.env) continue
    let value = line.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    process.env[key] = value
  }
}

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
