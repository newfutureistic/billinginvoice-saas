import { defineRoute } from '@/server/http/handler'
import { AuthService, type VerifyResult } from '@/server/services/auth.service'
import { verifyEmailSchema, type VerifyEmailInput } from '@/lib/validation/auth.schema'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/v1/auth/verify-email — confirm the 6-digit code, mark the email verified,
 * and provision the user's first workspace (AUTH_FLOW.md §3).
 */
export const POST = defineRoute<VerifyResult, VerifyEmailInput>({
  schema: { body: verifyEmailSchema },
  csrf: true,
  rateLimit: { limit: 10, windowMs: 60_000 },
  handler: ({ body, ctx }) => new AuthService(ctx).verifyEmail(body),
})
