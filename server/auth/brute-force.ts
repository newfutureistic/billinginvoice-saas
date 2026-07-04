import { getAuthEnv } from '@/server/config/env'

/**
 * Brute-force / account-lockout guard (AUTH_FLOW.md §4, §10).
 *
 * Defined as an interface — like the rate limiter — so production can back it with
 * Redis without touching call sites. The default is a dependency-free in-memory guard
 * keyed by `email:ip`: after `LOGIN_MAX_ATTEMPTS` failures the key is locked for
 * `LOGIN_LOCK_MINUTES`; a successful login clears the counter.
 */
export interface BruteForceStatus {
  locked: boolean
  /** Seconds until the lock releases (only when locked). */
  retryAfterSeconds?: number
  /** Remaining attempts before lockout (only when not locked). */
  remaining?: number
}

export interface BruteForceGuard {
  status(key: string): BruteForceStatus
  recordFailure(key: string): BruteForceStatus
  reset(key: string): void
}

interface Attempt {
  count: number
  lockUntil?: number
}

export class InMemoryBruteForceGuard implements BruteForceGuard {
  private readonly attempts = new Map<string, Attempt>()

  private get max(): number {
    return getAuthEnv().LOGIN_MAX_ATTEMPTS
  }

  private get lockMs(): number {
    return getAuthEnv().LOGIN_LOCK_MINUTES * 60_000
  }

  status(key: string, now: number = Date.now()): BruteForceStatus {
    const entry = this.attempts.get(key)
    if (!entry) return { locked: false, remaining: this.max }
    if (entry.lockUntil && entry.lockUntil > now) {
      return { locked: true, retryAfterSeconds: Math.ceil((entry.lockUntil - now) / 1000) }
    }
    if (entry.lockUntil && entry.lockUntil <= now) {
      // Lock elapsed — reset the window.
      this.attempts.delete(key)
      return { locked: false, remaining: this.max }
    }
    return { locked: false, remaining: Math.max(0, this.max - entry.count) }
  }

  recordFailure(key: string, now: number = Date.now()): BruteForceStatus {
    const entry = this.attempts.get(key) ?? { count: 0 }
    entry.count += 1
    if (entry.count >= this.max) {
      entry.lockUntil = now + this.lockMs
    }
    this.attempts.set(key, entry)
    return this.status(key, now)
  }

  reset(key: string): void {
    this.attempts.delete(key)
  }
}

/** Process-wide default guard. */
export const defaultBruteForceGuard: BruteForceGuard = new InMemoryBruteForceGuard()

/** Stable lockout key from the login identifier + client IP. */
export function bruteForceKey(email: string, ip: string | undefined): string {
  return `${email.trim().toLowerCase()}:${ip ?? 'unknown'}`
}
