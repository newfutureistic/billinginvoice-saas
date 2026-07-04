import NextAuth, { type NextAuthConfig, type User as AuthUserModel } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import GitHub from 'next-auth/providers/github'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/server/db/prisma'
import { authConfig } from '@/server/auth/auth.config'
import { getAuthEnv, isGoogleEnabled, isGithubEnabled, isProduction } from '@/server/config/env'
import { createSystemContext } from '@/server/http/context'
import { AuthService } from '@/server/services/auth.service'
import { SessionService } from '@/server/services/session.service'
import { bootstrapPersonalWorkspace } from '@/server/services/workspace-bootstrap'
import { signInSchema } from '@/lib/validation/auth.schema'

/**
 * Auth.js (NextAuth v5) instance — the single session authority (AUTH_FLOW.md §1).
 *
 * Providers: Credentials (email + password, backed by {@link AuthService}), Google and
 * GitHub (enabled only when configured). Because the Credentials provider mandates the
 * JWT session strategy, the JWT is made *revocable* by the server-side session registry:
 * the `jwt` callback mints a `sid` (a `Session` row) on sign-in, and the authentication
 * middleware validates/rotates/revokes it per request.
 */

/** Best-effort client IP from a standard `Request` inside `authorize`. */
function clientIp(request: Request | undefined): string | undefined {
  if (!request) return undefined
  const fwd = request.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0]?.trim()
  return request.headers.get('x-real-ip') ?? undefined
}

const credentialsProvider = Credentials({
  name: 'Credentials',
  credentials: {
    email: { label: 'Email', type: 'email' },
    password: { label: 'Password', type: 'password' },
    rememberMe: { label: 'Remember me', type: 'checkbox' },
  },
  async authorize(credentials, request) {
    const parsed = signInSchema.safeParse(credentials)
    if (!parsed.success) return null

    const ctx = createSystemContext('auth.credentials')
    ctx.ip = clientIp(request)
    ctx.userAgent = request?.headers.get('user-agent') ?? undefined

    const identity = await new AuthService(ctx).authenticate(parsed.data.email, parsed.data.password)
    if (!identity) return null

    return {
      id: identity.id,
      email: identity.email,
      name: identity.name,
      image: identity.image,
      rememberMe: parsed.data.rememberMe,
    } satisfies AuthUserModel
  },
})

function oauthProviders() {
  const env = getAuthEnv()
  const providers = []
  if (isGoogleEnabled()) {
    providers.push(
      Google({ clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET, allowDangerousEmailAccountLinking: true }),
    )
  }
  if (isGithubEnabled()) {
    providers.push(
      GitHub({ clientId: env.GITHUB_CLIENT_ID, clientSecret: env.GITHUB_CLIENT_SECRET, allowDangerousEmailAccountLinking: true }),
    )
  }
  return providers
}

const config: NextAuthConfig = {
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  secret: getAuthEnv().AUTH_SECRET,
  providers: [credentialsProvider, ...oauthProviders()],
  cookies: {
    sessionToken: {
      name: `${isProduction() ? '__Secure-' : ''}authjs.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProduction(),
      },
    },
  },
  callbacks: {
    ...authConfig.callbacks,
    /**
     * On sign-in (`user` present) enrich the token and register a revocable server-side
     * session (`sid`). On later requests the token passes through unchanged; revocation
     * is enforced by the authentication middleware against the registry.
     */
    async jwt({ token, user, trigger, session }) {
      if (user?.id) {
        const rememberMe = Boolean(user.rememberMe)
        token.userId = user.id
        token.rememberMe = rememberMe
        try {
          const ctx = createSystemContext('auth.jwt')
          const registered = await new SessionService(ctx).create(user.id, { rememberMe })
          token.sid = registered.id
        } catch (err) {
          // A registry miss must not block sign-in; the JWT still authenticates.
          console.error('[auth] session registry create failed', err)
        }
      }
      // Client-initiated refresh (session token rotation) via `unstable_update`.
      const sid = typeof token.sid === 'string' ? token.sid : undefined
      if (trigger === 'update' && sid && (session as { refresh?: boolean } | null)?.refresh) {
        const ctx = createSystemContext('auth.jwt.refresh')
        await new SessionService(ctx).refresh(sid).catch(() => undefined)
      }
      return token
    },
    async session({ session, token }) {
      if (typeof token.userId === 'string') session.user.id = token.userId
      if (typeof token.sid === 'string') session.sid = token.sid
      return session
    },
  },
  events: {
    /** OAuth sign-ups are provider-verified — give them their first workspace. */
    async createUser({ user }) {
      if (!user.id) return
      try {
        const ctx = createSystemContext('auth.oauth.createUser')
        await bootstrapPersonalWorkspace(ctx, user.id, user.name ?? user.email ?? 'My Workspace')
      } catch (err) {
        console.error('[auth] workspace bootstrap failed', err)
      }
    },
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(config)
