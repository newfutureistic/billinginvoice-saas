import { defineRoute } from '@/server/http/handler'
import { SessionService } from '@/server/services/session.service'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/v1/auth/logout — revoke the current server-side session and clear the
 * Auth.js cookie (AUTH_FLOW.md §7). Best-effort: it always clears the cookie even if
 * the session row is already gone.
 */
export const POST = defineRoute<{ ok: true }>({
  requireAuth: true,
  csrf: true,
  handler: async ({ ctx }) => {
    if (ctx.sessionId) await new SessionService(ctx).revoke(ctx.sessionId)
    const { signOut } = await import('@/server/auth')
    await signOut({ redirect: false })
    ctx.logger.info('auth.logout', { userId: ctx.user?.id })
    return { ok: true }
  },
})
