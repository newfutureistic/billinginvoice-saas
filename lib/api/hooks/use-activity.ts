'use client'

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/api/query-keys'
import { http } from '@/lib/api/http'
import type { ListResult } from '@/lib/api/errors'
import { useActiveWorkspace } from '@/lib/api/workspace-context'
import type { ActivityOutputDTO, AuditOutputDTO } from '@/lib/dto/activity.dto'
import type { PaginationQuery } from '@/lib/validation/common.schema'

/** Activity timeline — real feed from `/api/v1/activity`, replacing `mockActivityLogs`. */
export function useActivity(query?: PaginationQuery) {
  const workspaceId = useActiveWorkspace()
  return useQuery<ListResult<ActivityOutputDTO>>({
    queryKey: queryKeys.activity(query),
    queryFn: ({ signal }) => http.get('/activity', { query, workspaceId, signal }),
    enabled: Boolean(workspaceId),
  })
}

/** Audit log — real compliance trail from `/api/v1/audit` (OWNER/ADMIN only). */
export function useAudit(query?: PaginationQuery) {
  const workspaceId = useActiveWorkspace()
  return useQuery<ListResult<AuditOutputDTO>>({
    queryKey: queryKeys.audit(query),
    queryFn: ({ signal }) => http.get('/audit', { query, workspaceId, signal }),
    enabled: Boolean(workspaceId),
  })
}
