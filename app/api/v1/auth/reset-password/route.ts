import { defineRoute } from '@/server/http/handler'
import { AuthService } from '@/server/services/auth.service'
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/validation/auth.schema'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/v1/auth/reset-password — complete a password reset with a valid token,
 * then revoke every existing session for the user (AUTH_FLOW.md §5).
 */
export const POST = defineRoute<{ ok: true }, ResetPasswordInput>({
  schema: { body: resetPasswordSchema },
  csrf: true,
  rateLimit: { limit: 10, windowMs: 60_000 },
  handler: ({ body, ctx }) => new AuthService(ctx).resetPassword(body),
})
