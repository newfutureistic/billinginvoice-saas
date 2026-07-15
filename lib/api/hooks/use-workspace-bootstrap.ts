'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useWorkspaces } from '@/lib/api/hooks/use-workspaces'
import { useActiveWorkspace, useWorkspaceSwitch } from '@/lib/api/workspace-context'

/**
 * After sign-in, select the user's first workspace as the active tenant when none is set
 * yet. Every tenant-scoped hook is `enabled: Boolean(workspaceId)`, so without this the
 * dashboard would never fetch.
 *
 * Also self-heals a **stale / foreign** active workspace: if a different user previously
 * signed in on the same browser, the cached `activeWorkspaceId` would point at a workspace
 * the current user isn't a member of — every tenant request would then 403 ("Could not load
 * your dashboard"). So whenever the active id isn't among the current user's workspaces, we
 * reset it to their own first workspace.
 */
export function useWorkspaceBootstrap(): void {
  const { status } = useSession()
  const active = useActiveWorkspace()
  const setActive = useWorkspaceSwitch()
  const { data } = useWorkspaces()

  useEffect(() => {
    if (status !== 'authenticated') return
    const workspaces = data?.workspaces
    if (!workspaces || workspaces.length === 0) return
    const ownsActive = active ? workspaces.some((w) => w.id === active) : false
    if (!ownsActive) setActive(workspaces[0].id)
  }, [status, active, data, setActive])
}
