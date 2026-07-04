import type { RequestContext } from '@/server/http/context'
import { UnauthenticatedError } from '@/server/errors/app-error'
import { SessionService } from '@/server/services/session.service'

/**
 * Authentication middleware (RBAC.md §5, Layer 1).
 *
 * Reads the Auth.js session (JWT) for the current request and, when a server-side
 * session id (`sid`) is present, validates it against the revocation registry — so a
 * revoked or expired session is rejected even though its JWT cookie is still signed.
 * On success the authenticated principal + session id are attached to the context.
 *
 * `auth` is imported dynamically so routes that never require authentication don't pull
 * the full Auth.js/Prisma module graph into their bundle.
 */
export async function resolveAuth(
  ctx: RequestContext,
  options: { required?: boolean } = {},
): Promise<void> {
  const { auth } = await import('@/server/auth')
  const session = await auth()

  if (!session?.user?.id) {
    if (options.required) throw new UnauthenticatedError()
    return
  }
  const user = session.user

  // Enforce server-side revocation when the JWT carries a session id.
  if (session.sid) {
    const active = await new SessionService(ctx).validate(session.sid)
    if (!active) {
      if (options.required) throw new UnauthenticatedError('Your session has expired or been revoked')
      return
    }
    ctx.sessionId = session.sid
  }

  ctx.user = {
    id: user.id,
    email: user.email ?? '',
    name: user.name ?? null,
    image: user.image ?? null,
  }
  ctx.logger.debug('auth.resolved', { userId: user.id })
}

/** Assert an authenticated user is present on the context. */
export function requireUser(ctx: RequestContext): void {
  if (!ctx.user) throw new UnauthenticatedError()
}
