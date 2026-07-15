import type { NextAuthConfig } from 'next-auth'

/**
 * Edge-safe Auth.js base configuration.
 *
 * This module is imported by the Next.js edge `middleware.ts`, so it MUST NOT pull in
 * Node-only code (Prisma, bcrypt, the service layer). It carries only static config and
 * the `authorized` route-protection callback (AUTH_FLOW.md §8). The database-backed
 * providers, adapter and JWT/session callbacks are layered on in `server/auth/index.ts`
 * (Node runtime).
 */

/**
 * Route classes — only these prefixes require a session. `/invoice/*` is intentionally
 * public: it is the "try it free — no account required" tool experience (the frozen tool
 * pages advertise exactly that), and the builder runs on local state; saving/exporting
 * still goes through the authenticated `/api/v1` layer. Authenticated invoice management
 * lives under `/dashboard/*`.
 */
const PROTECTED_PREFIXES = ['/dashboard', '/onboarding'] as const

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

export const authConfig: NextAuthConfig = {
  // Providers are added in the Node config; the edge middleware only decodes the JWT.
  providers: [],
  session: {
    strategy: 'jwt',
    // Cookie lifetime is the longest ("remember me"); the server-side session registry
    // enforces the effective (possibly shorter) lifetime per session, and revocation.
    maxAge: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },
  pages: {
    signIn: '/auth/sign-in',
    error: '/auth/sign-in',
    verifyRequest: '/auth/verify-email',
    newUser: '/onboarding/welcome',
  },
  callbacks: {
    /**
     * Edge route guard: allow all public routes; require a session for the protected
     * prefixes, otherwise Auth.js redirects to the frozen sign-in page (with a
     * callbackUrl). API routes run their own, finer-grained authorization chain.
     */
    authorized({ auth, request: { nextUrl } }) {
      if (!isProtectedPath(nextUrl.pathname)) return true
      return Boolean(auth?.user)
    },
  },
}

export { isProtectedPath, PROTECTED_PREFIXES }
