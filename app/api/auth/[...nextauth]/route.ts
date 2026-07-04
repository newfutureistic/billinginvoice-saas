import { handlers } from '@/server/auth'

/**
 * Auth.js (NextAuth v5) catch-all handler — powers OAuth (Google/GitHub), the
 * Credentials callback, sign-out, CSRF token, and the session endpoint under
 * `/api/auth/*`. Node runtime (Prisma adapter + bcrypt Credentials provider).
 */
export const runtime = 'nodejs'

export const { GET, POST } = handlers
