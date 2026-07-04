'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/api/query-keys'
import { http } from '@/lib/api/http'
import type { ListResult } from '@/lib/api/errors'
import { useActiveWorkspace } from '@/lib/api/workspace-context'
import type { NotificationOutputDTO } from '@/lib/dto/notification.dto'
import type { NotificationListQuery } from '@/lib/validation/notification.schema'

/**
 * Notifications — real feed + unread badge, replacing `mockNotifications`.
 * Backs the frozen bell icon (unread count) and notifications page (mark read / read all).
 */
export function useNotifications(query?: NotificationListQuery) {
  const workspaceId = useActiveWorkspace()
  return useQuery<ListResult<NotificationOutputDTO>>({
    queryKey: queryKeys.notifications.list(query),
    queryFn: ({ signal }) => http.get('/notifications', { query, workspaceId, signal }),
    enabled: Boolean(workspaceId),
  })
}

export function useUnreadNotificationCount() {
  const workspaceId = useActiveWorkspace()
  return useQuery<{ count: number }>({
    queryKey: queryKeys.notifications.unread,
    queryFn: ({ signal }) => http.get('/notifications/unread-count', { workspaceId, signal }),
    enabled: Boolean(workspaceId),
    refetchInterval: 60_000,
  })
}

function useNotificationsInvalidate() {
  const qc = useQueryClient()
  return () => {
    qc.invalidateQueries({ queryKey: queryKeys.notifications.all })
  }
}

export function useMarkNotificationRead() {
  const invalidate = useNotificationsInvalidate()
  const workspaceId = useActiveWorkspace()
  return useMutation<NotificationOutputDTO, unknown, string>({
    mutationFn: (id) => http.post(`/notifications/${id}/read`, undefined, { workspaceId }),
    onSuccess: invalidate,
  })
}

export function useMarkAllNotificationsRead() {
  const invalidate = useNotificationsInvalidate()
  const workspaceId = useActiveWorkspace()
  return useMutation<{ updated: number }, unknown, void>({
    mutationFn: () => http.post('/notifications/read-all', undefined, { workspaceId }),
    onSuccess: invalidate,
  })
}
