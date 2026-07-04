import { defineRoute } from '@/server/http/handler'
import { AuthService } from '@/server/services/auth.service'
import { signUpSchema, type SignUpInput } from '@/lib/validation/auth.schema'
import type { SignupResult } from '@/server/services/auth.service'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/v1/auth/signup — create a credentials account and issue a 6-digit email
 * verification code (AUTH_FLOW.md §3). Rate-limited + CSRF-checked. The account is
 * created unverified; the first workspace is provisioned on verification.
 */
export const POST = defineRoute<SignupResult, SignUpInput>({
  schema: { body: signUpSchema },
  csrf: true,
  rateLimit: { limit: 10, windowMs: 60_000 },
  status: 201,
  handler: ({ body, ctx }) => new AuthService(ctx).signup(body),
})
