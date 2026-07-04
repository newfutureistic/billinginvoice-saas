import NextAuth from 'next-auth'
import { authConfig } from '@/server/auth/auth.config'

/**
 * Edge route protection (AUTH_FLOW.md §8, RBAC.md §5 Layer 1).
 *
 * Next.js 16 renamed the `middleware` convention to `proxy`. This is a cookie-only
 * session check at the edge: public routes always pass; the protected prefixes
 * (`/dashboard`, `/invoice`, `/onboarding`) require a session, otherwise Auth.js
 * redirects to the frozen sign-in page (with a callbackUrl). Full authorization
 * (membership + RBAC) is enforced separately in the `/api/*` middleware chain. Uses the
 * edge-safe `authConfig` only — no Prisma/bcrypt — and changes no page markup.
 */
const { auth } = NextAuth(authConfig)

// Export as a default function so Next.js's static analysis recognizes the entry point.
export default auth

export const config = {
  // Exclude Next internals, static assets, and API routes (APIs self-authorize).
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|css|js|map)$).*)',
  ],
}
