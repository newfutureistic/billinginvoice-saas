import { defineRoute } from '@/server/http/handler'
import { AuthService } from '@/server/services/auth.service'
import { changePasswordSchema, type ChangePasswordInput } from '@/lib/validation/auth.schema'
import { UnauthenticatedError } from '@/server/errors/app-error'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/v1/auth/change-password — change the password of the signed-in user after
 * verifying the current one, then revoke all *other* sessions (AUTH_FLOW.md §7).
 */
export const POST = defineRoute<{ ok: true }, ChangePasswordInput>({
  requireAuth: true,
  schema: { body: changePasswordSchema },
  csrf: true,
  rateLimit: { limit: 10, windowMs: 60_000 },
  handler: ({ body, ctx }) => {
    if (!ctx.user) throw new UnauthenticatedError()
    return new AuthService(ctx).changePassword(ctx.user.id, body)
  },
})
