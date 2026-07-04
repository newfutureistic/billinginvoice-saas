import type { NextRequest } from 'next/server'
import { BadRequestError } from '@/server/errors/app-error'
import { getAuthEnv } from '@/server/config/env'

/**
 * CSRF protection for the JSON API (Security §8).
 *
 * Auth.js applies its own token-based CSRF to `/api/auth/*`. For our first-party
 * `/api/v1/*` mutations (protected by SameSite=Lax, HttpOnly session cookies) we add an
 * origin allow-list check on state-changing methods: a browser always sends `Origin` on
 * cross-origin unsafe requests, so a mismatch is rejected. Requests with no `Origin`
 * (server-to-server, same-origin GET) are allowed through.
 */
const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

export function enforceCsrf(req: NextRequest, allowedOrigins?: string[]): void {
  if (!UNSAFE_METHODS.has(req.method.toUpperCase())) return

  const origin = req.headers.get('origin')
  if (!origin) return // non-browser client — no ambient-cookie CSRF vector

  if (isOriginAllowed(origin, req, allowedOrigins)) return
  throw new BadRequestError('Request origin is not allowed')
}

function isOriginAllowed(origin: string, req: NextRequest, allowed?: string[]): boolean {
  if (allowed && allowed.includes(origin)) return true

  const configured = getAuthEnv().AUTH_URL
  if (configured && sameOrigin(origin, configured)) return true

  // Same-origin as the request host (covers local/dev and single-domain deploys).
  const host = req.headers.get('host')
  if (host) {
    try {
      if (new URL(origin).host === host) return true
    } catch {
      return false
    }
  }
  return false
}

function sameOrigin(a: string, b: string): boolean {
  try {
    const ua = new URL(a)
    const ub = new URL(b)
    return ua.origin === ub.origin
  } catch {
    return false
  }
}
