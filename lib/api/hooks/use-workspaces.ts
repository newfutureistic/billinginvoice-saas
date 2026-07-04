'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/api/query-keys'
import { http } from '@/lib/api/http'
import { useActiveWorkspace, useWorkspaceSwitch } from '@/lib/api/workspace-context'
import type { WorkspaceOutputDTO, OrganizationOutputDTO } from '@/lib/dto/workspace.dto'
import type { WorkspaceDetailDTO } from '@/server/services/workspace.service'
import type { WorkspaceCreateInput, OrganizationSettingsInput } from '@/lib/validation/workspace.schema'

/**
 * Workspaces — real switching + settings, replacing mock workspace data. `useWorkspaces`
 * backs the frozen WorkspaceSwitcher; `useWorkspaceSwitch` (from the context) performs the
 * real switch that re-scopes every tenant query.
 */
export function useWorkspaces() {
  return useQuery<{ workspaces: WorkspaceOutputDTO[] }>({
    queryKey: queryKeys.workspaces,
    queryFn: ({ signal }) => http.get('/workspaces', { signal }),
  })
}

export function useWorkspaceDetail() {
  const workspaceId = useActiveWorkspace()
  return useQuery<WorkspaceDetailDTO>({
    queryKey: queryKeys.workspaceDetail,
    queryFn: ({ signal }) => http.get('/workspace', { workspaceId, signal }),
    enabled: Boolean(workspaceId),
  })
}

export function useWorkspaceSettings() {
  const workspaceId = useActiveWorkspace()
  return useQuery<OrganizationOutputDTO | null>({
    queryKey: queryKeys.workspaceSettings,
    queryFn: ({ signal }) => http.get('/workspace/settings', { workspaceId, signal }),
    enabled: Boolean(workspaceId),
  })
}

export function useCreateWorkspace() {
  const qc = useQueryClient()
  const switchWorkspace = useWorkspaceSwitch()
  return useMutation<WorkspaceOutputDTO, unknown, WorkspaceCreateInput>({
    mutationFn: (input) => http.post('/workspaces', input),
    onSuccess: (workspace) => {
      switchWorkspace(workspace.id) // real switch to the freshly-created workspace
      qc.invalidateQueries({ queryKey: queryKeys.workspaces })
    },
  })
}

export function useUpdateWorkspace() {
  const qc = useQueryClient()
  const workspaceId = useActiveWorkspace()
  return useMutation<WorkspaceOutputDTO, unknown, { name?: string }>({
    mutationFn: (input) => http.patch('/workspace', input, { workspaceId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.workspaceDetail })
      qc.invalidateQueries({ queryKey: queryKeys.workspaces })
    },
  })
}

export function useUpdateWorkspaceSettings() {
  const qc = useQueryClient()
  const workspaceId = useActiveWorkspace()
  return useMutation<OrganizationOutputDTO, unknown, OrganizationSettingsInput>({
    mutationFn: (input) => http.patch('/workspace/settings', input, { workspaceId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.workspaceSettings }),
  })
}

export { useActiveWorkspace, useWorkspaceSwitch }
