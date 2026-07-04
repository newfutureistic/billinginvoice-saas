import { defineRoute } from '@/server/http/handler'
import { AuthService } from '@/server/services/auth.service'
import {
  resendVerificationSchema,
  type ResendVerificationInput,
} from '@/lib/validation/auth.schema'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/v1/auth/resend-verification — reissue a verification code (AUTH_FLOW.md §3).
 * Always responds success (no enumeration); the 30s throttle is enforced by the rate
 * limit window (2/min per IP).
 */
export const POST = defineRoute<{ ok: true }, ResendVerificationInput>({
  schema: { body: resendVerificationSchema },
  csrf: true,
  rateLimit: { limit: 2, windowMs: 60_000 },
  handler: async ({ body, ctx }) => {
    await new AuthService(ctx).resendVerification(body)
    return { ok: true }
  },
})
