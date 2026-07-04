import { randomBytes, randomInt, createHash, timingSafeEqual } from 'node:crypto'

/**
 * Secure token utilities for email verification, password reset, invitations and
 * session identifiers.
 *
 * Convention (matches AUTH_FLOW.md §10): the *raw* token is delivered to the user
 * (email link / 6-digit code) and only its **hash** is persisted, so a database leak
 * never yields usable tokens. Lookups hash the incoming token and compare in constant
 * time.
 */

/** Purpose namespaces stored as the `identifier` prefix on `VerificationToken`. */
export const TokenPurpose = {
  EMAIL_VERIFY: 'email-verify',
  PASSWORD_RESET: 'password-reset',
} as const
export type TokenPurpose = (typeof TokenPurpose)[keyof typeof TokenPurpose]

/** Namespaced `VerificationToken.identifier`, e.g. `email-verify:user@example.com`. */
export function tokenIdentifier(purpose: TokenPurpose, subject: string): string {
  return `${purpose}:${subject.toLowerCase()}`
}

/** URL-safe random token (default 32 bytes → 43 chars). Used for reset/invite links. */
export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url')
}

/** Opaque session identifier for the server-side session registry / JWT `sid` claim. */
export function generateSessionId(): string {
  return randomBytes(24).toString('base64url')
}

/** Cryptographically-uniform numeric code (default 6 digits) for email verification. */
export function generateNumericCode(digits = 6): string {
  const max = 10 ** digits
  return String(randomInt(0, max)).padStart(digits, '0')
}

/** SHA-256 hash (hex) of a raw token — this is what gets stored. */
export function hashToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex')
}

/** Constant-time string comparison that never short-circuits on length. */
export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ab.length !== bb.length) {
    // Compare against self to keep timing uniform, then fail.
    timingSafeEqual(ab, ab)
    return false
  }
  return timingSafeEqual(ab, bb)
}

/** Verify a raw token against a stored hash in constant time. */
export function verifyTokenHash(raw: string, storedHash: string): boolean {
  return safeEqual(hashToken(raw), storedHash)
}

/** Now + `minutes`, as a Date (token/reset expiry). */
export function expiresInMinutes(minutes: number): Date {
  return new Date(Date.now() + minutes * 60_000)
}

/** Now + `days`, as a Date (session / invitation expiry). */
export function expiresInDays(days: number): Date {
  return new Date(Date.now() + days * 86_400_000)
}
