import type { NextRequest } from 'next/server'
import type { RequestContext } from '@/server/http/context'

/**
 * Populate the request context with best-effort client metadata (IP + user-agent) for
 * audit logging and rate limiting. No DB, no auth — runs early for every request.
 */
export function resolveClientMeta(req: NextRequest, ctx: RequestContext): void {
  const fwd = req.headers.get('x-forwarded-for')
  ctx.ip = (fwd ? fwd.split(',')[0]?.trim() : undefined) ?? req.headers.get('x-real-ip') ?? undefined
  ctx.userAgent = req.headers.get('user-agent') ?? undefined
}
