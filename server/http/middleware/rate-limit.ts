import type { NextRequest } from 'next/server'
import type { RequestContext } from '@/server/http/context'
import { RateLimitError } from '@/server/errors/app-error'

/**
 * Rate limiting is defined as an interface so production can back it with Redis/Upstash
 * without touching call sites. A dependency-free in-memory limiter is provided as the
 * default for local/dev, plus a no-op for disabling.
 */
export interface RateLimitResult {
  allowed: boolean
  limit: number
  remaining: number
  /** Epoch ms when the window resets. */
  resetAt: number
}

export interface RateLimiter {
  check(key: string, options: RateLimitWindow): Promise<RateLimitResult>
}

export interface RateLimitWindow {
  limit: number
  windowMs: number
}

/** Fixed-window in-memory limiter. Suitable for a single instance / development. */
export class InMemoryRateLimiter implements RateLimiter {
  private readonly hits = new Map<string, { count: number; resetAt: number }>()

  async check(key: string, { limit, windowMs }: RateLimitWindow): Promise<RateLimitResult> {
    const now = Date.now()
    const entry = this.hits.get(key)
    if (!entry || entry.resetAt <= now) {
      const resetAt = now + windowMs
      this.hits.set(key, { count: 1, resetAt })
      return { allowed: true, limit, remaining: limit - 1, resetAt }
    }
    entry.count += 1
    const remaining = Math.max(0, limit - entry.count)
    return { allowed: entry.count <= limit, limit, remaining, resetAt: entry.resetAt }
  }
}

/** Always-allow limiter (feature flag / tests). */
export const NoopRateLimiter: RateLimiter = {
  async check(_key, { limit }) {
    return { allowed: true, limit, remaining: limit, resetAt: Date.now() }
  },
}

/** Default process-wide limiter instance. */
export const defaultRateLimiter: RateLimiter = new InMemoryRateLimiter()

/** Build a stable rate-limit key from client IP + route + optional workspace. */
export function rateLimitKey(req: NextRequest, ctx: RequestContext): string {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  return `${ip}:${ctx.method}:${ctx.path}:${ctx.workspaceId ?? '-'}`
}

/** Enforce the limit, throwing {@link RateLimitError} (429) when exceeded. */
export async function enforceRateLimit(
  limiter: RateLimiter,
  key: string,
  window: RateLimitWindow,
): Promise<RateLimitResult> {
  const result = await limiter.check(key, window)
  if (!result.allowed) {
    const retryAfter = Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000))
    throw new RateLimitError('Rate limit exceeded', retryAfter)
  }
  return result
}
