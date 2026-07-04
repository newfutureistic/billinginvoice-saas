'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

/**
 * Active-workspace context — the client-side source of truth for which workspace the
 * tenant-scoped hooks target (sent as `x-workspace-id`). Persisted to a cookie so it
 * survives reloads and is available to the edge/server. The frozen `WorkspaceSwitcher`
 * drives this via {@link useWorkspaceSwitch}; real workspace switching = calling `set`.
 */
interface WorkspaceContextValue {
  activeWorkspaceId: string | null
  setActiveWorkspaceId: (id: string) => void
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

const COOKIE = 'activeWorkspaceId'

function readCookie(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

export function WorkspaceProvider({
  children,
  initialWorkspaceId = null,
}: {
  children: React.ReactNode
  initialWorkspaceId?: string | null
}) {
  const [activeWorkspaceId, setId] = useState<string | null>(initialWorkspaceId)

  useEffect(() => {
    if (!activeWorkspaceId) {
      const fromCookie = readCookie()
      if (fromCookie) setId(fromCookie)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setActiveWorkspaceId = useCallback((id: string) => {
    setId(id)
    if (typeof document !== 'undefined') {
      document.cookie = `${COOKIE}=${encodeURIComponent(id)}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`
    }
  }, [])

  return (
    <WorkspaceContext.Provider value={{ activeWorkspaceId, setActiveWorkspaceId }}>
      {children}
    </WorkspaceContext.Provider>
  )
}

/** The active workspace id (or null before one is selected). */
export function useActiveWorkspace(): string | null {
  return useContext(WorkspaceContext)?.activeWorkspaceId ?? null
}

/** Switch the active workspace (real workspace switching). */
export function useWorkspaceSwitch(): (id: string) => void {
  const ctx = useContext(WorkspaceContext)
  return ctx?.setActiveWorkspaceId ?? (() => undefined)
}
