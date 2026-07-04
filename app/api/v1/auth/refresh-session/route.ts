import { defineRoute } from '@/server/http/handler'
import { SessionService } from '@/server/services/session.service'
import { UnauthenticatedError } from '@/server/errors/app-error'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/v1/auth/refresh-session — rotate the current session's opaque token and
 * slide its expiry forward (token rotation, AUTH_FLOW.md §7). Requires an active session.
 */
export const POST = defineRoute<{ ok: true; expiresAt: string }>({
  requireAuth: true,
  csrf: true,
  handler: async ({ ctx }) => {
    if (!ctx.sessionId) throw new UnauthenticatedError()
    const session = await new SessionService(ctx).refresh(ctx.sessionId)
    if (!session) throw new UnauthenticatedError('Session is no longer active')
    return { ok: true, expiresAt: session.expires.toISOString() }
  },
})
