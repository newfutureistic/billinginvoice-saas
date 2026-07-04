import type { DefaultSession } from 'next-auth'

/**
 * Module augmentation for Auth.js (Mission 4).
 *
 * Adds the workspace-aware claims we thread through the JWT and session so the rest of
 * the app is fully typed: `session.user.id`, the server-side session id (`sid`) that
 * links the JWT to the revocation registry, and the `rememberMe` flag.
 */
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
    } & DefaultSession['user']
    /** Server-side session id (JWT `sid`) — key into the revocation registry. */
    sid?: string
  }

  interface User {
    /** Carried from the Credentials `authorize` result into the JWT callback. */
    rememberMe?: boolean
  }
}

// The JWT interface lives in `@auth/core/jwt` (re-exported by `next-auth/jwt`), so the
// augmentation must target the source module to actually merge.
declare module '@auth/core/jwt' {
  interface JWT {
    userId?: string
    sid?: string
    rememberMe?: boolean
  }
}
