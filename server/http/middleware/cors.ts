import type { NextRequest } from 'next/server'

export interface CorsOptions {
  /** Allowed origin(s). `true` reflects the request origin; `'*'` allows any. */
  origin?: string | string[] | boolean
  methods?: string[]
  allowedHeaders?: string[]
  credentials?: boolean
  maxAgeSeconds?: number
}

const DEFAULTS: Required<CorsOptions> = {
  origin: false,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-workspace-id', 'x-request-id'],
  credentials: false,
  maxAgeSeconds: 600,
}

function resolveOrigin(requestOrigin: string | null, allowed: CorsOptions['origin']): string | null {
  if (allowed === true) return requestOrigin ?? '*'
  if (allowed === '*') return '*'
  if (typeof allowed === 'string') return allowed
  if (Array.isArray(allowed)) return requestOrigin && allowed.includes(requestOrigin) ? requestOrigin : null
  return null // origin disabled → same-origin only
}

/** Build CORS response headers for a request given the route's CORS config. */
export function buildCorsHeaders(req: NextRequest, options: CorsOptions = {}): Record<string, string> {
  const opts = { ...DEFAULTS, ...options }
  const allowOrigin = resolveOrigin(req.headers.get('origin'), opts.origin)
  if (!allowOrigin) return {}

  const headers: Record<string, string> = {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': opts.methods.join(', '),
    'Access-Control-Allow-Headers': opts.allowedHeaders.join(', '),
    'Access-Control-Max-Age': String(opts.maxAgeSeconds),
    Vary: 'Origin',
  }
  if (opts.credentials) headers['Access-Control-Allow-Credentials'] = 'true'
  return headers
}

export function isPreflight(req: NextRequest): boolean {
  return req.method === 'OPTIONS' && req.headers.has('access-control-request-method')
}
