import bcrypt from 'bcryptjs'
import { getAuthEnv } from '@/server/config/env'

/**
 * Password hashing (bcrypt).
 *
 * Uses `bcryptjs` — the pure-JS bcrypt implementation — so there is no native build
 * step (portable across Windows / serverless / CI). Hashes are standard `$2b$`
 * bcrypt digests. The work factor is configurable via `BCRYPT_COST` (default 12).
 *
 * The password *policy* (length / character classes) lives once in
 * `lib/validation/auth.schema.ts` (`passwordSchema`) and is reused by every endpoint —
 * this module only performs the cryptographic hash/verify, never re-validates shape.
 */

/** Hash a plaintext password with a per-hash random salt. */
export async function hashPassword(plain: string): Promise<string> {
  const cost = getAuthEnv().BCRYPT_COST
  return bcrypt.hash(plain, cost)
}

/**
 * Verify a plaintext password against a stored bcrypt hash. Returns false for
 * OAuth-only accounts (null hash) without leaking that distinction to callers, and
 * never throws on a malformed hash.
 */
export async function verifyPassword(
  plain: string,
  hash: string | null | undefined,
): Promise<boolean> {
  if (!hash) return false
  try {
    return await bcrypt.compare(plain, hash)
  } catch {
    return false
  }
}

/**
 * True when a stored hash was produced with a lower work factor than the current
 * target — used to transparently re-hash on next successful login (upgrade in place).
 */
export function needsRehash(hash: string): boolean {
  const target = getAuthEnv().BCRYPT_COST
  const match = /^\$2[aby]\$(\d{2})\$/.exec(hash)
  if (!match) return true
  return Number(match[1]) < target
}
