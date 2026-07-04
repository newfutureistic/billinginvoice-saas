import { defineRoute } from '@/server/http/handler'
import { AuthService } from '@/server/services/auth.service'
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validation/auth.schema'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/v1/auth/forgot-password — begin a password reset (AUTH_FLOW.md §5).
 * Always responds success (no account enumeration); a reset link is sent only when the
 * account exists.
 */
export const POST = defineRoute<{ ok: true }, ForgotPasswordInput>({
  schema: { body: forgotPasswordSchema },
  csrf: true,
  rateLimit: { limit: 5, windowMs: 60_000 },
  handler: async ({ body, ctx }) => {
    await new AuthService(ctx).forgotPassword(body)
    return { ok: true }
  },
})
