'use client'

import { useSession } from 'next-auth/react'

/**
 * Auth.js session helpers — replace the mock auth. `useSession` reads the real session
 * (from `SessionProvider`); the edge `proxy.ts` already redirects unauthenticated users
 * away from protected routes, and page-level guards can use these for finer control.
 */
export { useSession, signIn, signOut } from 'next-auth/react'

export function useIsAuthenticated(): boolean {
  return useSession().status === 'authenticated'
}

export function useIsAuthLoading(): boolean {
  return useSession().status === 'loading'
}

export function useSessionUser() {
  return useSession().data?.user ?? null
}
