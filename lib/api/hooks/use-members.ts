'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/api/query-keys'
import { http } from '@/lib/api/http'
import type { ListResult } from '@/lib/api/errors'
import { useActiveWorkspace } from '@/lib/api/workspace-context'
import type { MemberDTO } from '@/lib/dto/auth.dto'
import type {
  InviteMemberInput,
  ChangeRoleInput,
  AcceptInviteInput,
  TransferOwnershipInput,
} from '@/lib/validation/auth.schema'

/**
 * Workspace members — real member list + permissions, replacing `mockTeamMembers`.
 * Backs the frozen team page (invite / change role / remove / transfer ownership).
 */
export function useMembers() {
  const workspaceId = useActiveWorkspace()
  return useQuery<ListResult<MemberDTO>>({
    queryKey: queryKeys.members,
    queryFn: ({ signal }) => http.get('/members', { workspaceId, signal }),
    enabled: Boolean(workspaceId),
  })
}

function useMembersInvalidate() {
  const qc = useQueryClient()
  return () => qc.invalidateQueries({ queryKey: queryKeys.members })
}

export function useInviteMember() {
  const invalidate = useMembersInvalidate()
  const workspaceId = useActiveWorkspace()
  return useMutation<{ invitationId: string }, unknown, InviteMemberInput>({
    mutationFn: (input) => http.post('/members', input, { workspaceId }),
    onSuccess: invalidate,
  })
}

export function useChangeMemberRole() {
  const invalidate = useMembersInvalidate()
  const workspaceId = useActiveWorkspace()
  return useMutation<{ id: string; role: string }, unknown, { userId: string; input: ChangeRoleInput }>({
    mutationFn: ({ userId, input }) => http.patch(`/members/${userId}`, input, { workspaceId }),
    onSuccess: invalidate,
  })
}

export function useRemoveMember() {
  const invalidate = useMembersInvalidate()
  const workspaceId = useActiveWorkspace()
  return useMutation<{ ok: true }, unknown, string>({
    mutationFn: (userId) => http.del(`/members/${userId}`, { workspaceId }),
    onSuccess: invalidate,
  })
}

export function useAcceptInvite() {
  const qc = useQueryClient()
  return useMutation<{ workspaceId: string; role: string }, unknown, AcceptInviteInput>({
    mutationFn: (input) => http.post('/invitations/accept', input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.members })
      qc.invalidateQueries({ queryKey: queryKeys.workspaces })
    },
  })
}

export function useTransferOwnership() {
  const invalidate = useMembersInvalidate()
  const workspaceId = useActiveWorkspace()
  return useMutation<{ ok: true }, unknown, TransferOwnershipInput>({
    mutationFn: (input) => http.post('/workspace/transfer-ownership', input, { workspaceId }),
    onSuccess: invalidate,
  })
}
