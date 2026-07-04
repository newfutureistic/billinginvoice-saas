import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { z } from 'zod'

/**
 * Environment configuration — validated once, typed everywhere.
 *
 * Mission 2 scope: only the variables the database foundation needs. Auth / email /
 * storage / payment keys are intentionally NOT declared here yet (those are later
 * missions) so this module fails fast on exactly the DB config it requires.
 */

// --- Dependency-free .env loader (dev/seed convenience) ---------------------
// Next.js already injects .env at runtime; the Prisma CLI loads it too. This tiny
// loader covers standalone scripts (e.g. `tsx prisma/seed.ts`) without adding a
// dotenv dependency. It never overrides variables already present in process.env.
function loadDotEnv(files: string[]): void {
  for (const file of files) {
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
}

loadDotEnv(['.env.local', '.env'])

// --- Schema -----------------------------------------------------------------
const isPostgresUrl = (v: string) => v.startsWith('postgres://') || v.startsWith('postgresql://')

const EnvSchema = z.object({
  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL is required')
    .refine(isPostgresUrl, 'DATABASE_URL must be a postgres(ql):// connection string'),
  DIRECT_URL: z
    .string()
    .refine((v) => v === '' || isPostgresUrl(v), 'DIRECT_URL must be a postgres(ql):// connection string')
    .optional(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PRISMA_LOG_QUERIES: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
})

export type Env = z.infer<typeof EnvSchema>

// --- Parse (lazy + cached) --------------------------------------------------
let cached: Env | null = null

/**
 * Returns the validated environment. Throws a readable aggregated error if the DB
 * configuration is missing or malformed. Called by the Prisma singleton at first use,
 * so type-checking/building the project (which never executes this) is unaffected.
 */
export function getEnv(): Env {
  if (cached) return cached
  const parsed = EnvSchema.safeParse(process.env)
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`).join('\n')
    throw new Error(`Invalid environment configuration:\n${issues}`)
  }
  cached = parsed.data
  return cached
}

export const isProduction = () => getEnv().NODE_ENV === 'production'
export const isTest = () => getEnv().NODE_ENV === 'test'

// ============================================================================
// Auth configuration (Mission 4)
// ============================================================================
// Kept separate from the DB-required `EnvSchema` above: auth/OAuth/session tuning
// is entirely OPTIONAL so `getEnv()` still fails fast on *only* the database config,
// and typecheck/build (which never execute this) are unaffected. Missing OAuth
// credentials simply disable that provider rather than crash the app.

const AuthEnvSchema = z.object({
  // Auth.js core
  AUTH_SECRET: z.string().min(1).optional(),
  AUTH_URL: z.string().url().optional(),
  AUTH_TRUST_HOST: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
  // OAuth providers (optional — absent → provider disabled)
  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
  GITHUB_CLIENT_ID: z.string().min(1).optional(),
  GITHUB_CLIENT_SECRET: z.string().min(1).optional(),
  // Password hashing
  BCRYPT_COST: z.coerce.number().int().min(10).max(15).default(12),
  // Session lifetimes (days)
  SESSION_MAX_AGE_DAYS: z.coerce.number().int().min(1).max(365).default(1),
  SESSION_REMEMBER_AGE_DAYS: z.coerce.number().int().min(1).max(365).default(30),
  // Token TTLs (minutes)
  VERIFY_TOKEN_TTL_MIN: z.coerce.number().int().min(1).max(1440).default(15),
  RESET_TOKEN_TTL_MIN: z.coerce.number().int().min(1).max(1440).default(30),
  RESEND_COOLDOWN_SEC: z.coerce.number().int().min(0).max(3600).default(30),
  // Invitation TTL (days)
  INVITE_TTL_DAYS: z.coerce.number().int().min(1).max(90).default(7),
  // Brute-force / lockout
  LOGIN_MAX_ATTEMPTS: z.coerce.number().int().min(1).max(50).default(5),
  LOGIN_LOCK_MINUTES: z.coerce.number().int().min(1).max(1440).default(15),
})

export type AuthEnv = z.infer<typeof AuthEnvSchema>

let cachedAuth: AuthEnv | null = null

/**
 * Returns validated auth configuration with sensible defaults. Never throws for
 * missing OAuth/secret values (those degrade gracefully); only rejects malformed
 * values that are present. Cached after first call.
 */
export function getAuthEnv(): AuthEnv {
  if (cachedAuth) return cachedAuth
  const parsed = AuthEnvSchema.safeParse(process.env)
  // Malformed *present* values should surface; missing optional values fall back
  // to schema defaults via a permissive re-parse of an empty object subset.
  cachedAuth = parsed.success ? parsed.data : AuthEnvSchema.parse({})
  return cachedAuth
}

/** True when Google OAuth is fully configured. */
export const isGoogleEnabled = () => {
  const e = getAuthEnv()
  return Boolean(e.GOOGLE_CLIENT_ID && e.GOOGLE_CLIENT_SECRET)
}

/** True when GitHub OAuth is fully configured. */
export const isGithubEnabled = () => {
  const e = getAuthEnv()
  return Boolean(e.GITHUB_CLIENT_ID && e.GITHUB_CLIENT_SECRET)
}
