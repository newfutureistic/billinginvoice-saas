'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/api/query-keys'
import { http } from '@/lib/api/http'
import { useActiveWorkspace } from '@/lib/api/workspace-context'
import type { CurrentUserDTO } from '@/lib/dto/auth.dto'
import type { UserOutputDTO } from '@/lib/dto/user.dto'
import type { UserUpdateInput } from '@/lib/validation/user.schema'
import type { Permission } from '@/server/auth/permissions'

/**
 * The signed-in user in the active workspace: identity + memberships + the active role's
 * permission set. Replaces `mockUserProfile` and powers the permission guards below.
 */
export function useCurrentUser() {
  const workspaceId = useActiveWorkspace()
  return useQuery<CurrentUserDTO>({
    queryKey: [...queryKeys.currentUser, workspaceId],
    queryFn: ({ signal }) => http.get('/auth/current-user', { workspaceId, signal }),
  })
}

/** The active role's permissions (RBAC) — the source for `useHasPermission`. */
export function usePermissions(): Permission[] {
  const { data } = useCurrentUser()
  return (data?.permissions ?? []) as Permission[]
}

/** Permission guard: true when the active role holds `permission`. */
export function useHasPermission(permission: Permission): boolean {
  return usePermissions().includes(permission)
}

export function useActiveRole(): string | null {
  return useCurrentUser().data?.activeRole ?? null
}

/** The editable profile (name / timezone / avatar). */
export function useProfile() {
  return useQuery<UserOutputDTO>({
    queryKey: ['profile'],
    queryFn: ({ signal }) => http.get('/auth/profile', { signal }),
  })
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation<UserOutputDTO, unknown, UserUpdateInput>({
    mutationFn: (input) => http.patch('/auth/profile', input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile'] })
      qc.invalidateQueries({ queryKey: queryKeys.currentUser })
    },
  })
}
