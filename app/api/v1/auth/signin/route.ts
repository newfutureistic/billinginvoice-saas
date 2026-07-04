import { defineRoute } from '@/server/http/handler'
import { UserRepository } from '@/server/repositories/user.repository'
import { UnauthenticatedError } from '@/server/errors/app-error'
import { signInSchema, type SignInInput } from '@/lib/validation/auth.schema'
import { toUserDTO, type UserOutputDTO } from '@/lib/dto/user.dto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface SignInResult {
  user: UserOutputDTO
  /** Where the client should route next (mirrors the frozen flow). */
  next: 'dashboard' | 'verify-email'
}

/**
 * POST /api/v1/auth/signin — establish a session for email + password (AUTH_FLOW.md §4).
 * Delegates to Auth.js `signIn('credentials')`, whose `authorize` runs the full
 * brute-force-protected, audited verification via {@link AuthService}. Tight rate limit
 * and CSRF origin check guard the endpoint.
 */
export const POST = defineRoute<SignInResult, SignInInput>({
  schema: { body: signInSchema },
  csrf: true,
  rateLimit: { limit: 10, windowMs: 60_000 },
  handler: async ({ body, ctx }) => {
    const { signIn } = await import('@/server/auth')
    try {
      await signIn('credentials', {
        email: body.email,
        password: body.password,
        rememberMe: body.rememberMe,
        redirect: false,
      })
    } catch {
      // Any Auth.js error here means the credentials were rejected.
      throw new UnauthenticatedError('Invalid email or password')
    }

    const user = await new UserRepository().findByEmail(body.email)
    if (!user) throw new UnauthenticatedError('Invalid email or password')

    ctx.logger.info('auth.signin', { userId: user.id })
    return {
      user: toUserDTO(user),
      next: user.emailVerified ? 'dashboard' : 'verify-email',
    }
  },
})
