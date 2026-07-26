'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { http } from '@/lib/api/http'
import type { AdminUserDTO } from '@/lib/dto/user.dto'

interface Paginated<T> {
  items: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

/** Site-admin "all users" listing — platform-wide, not scoped to the active workspace. */
export function useAdminUsers(params: { page?: number } = {}) {
  const qs = new URLSearchParams()
  if (params.page) qs.set('page', String(params.page))
  const suffix = qs.toString() ? `?${qs}` : ''
  return useQuery<Paginated<AdminUserDTO>>({
    queryKey: ['admin', 'users', params],
    queryFn: ({ signal }) => http.get(`/admin/users${suffix}`, { signal }),
  })
}

/** Permanently delete a platform user (site admin only). */
export function useDeleteAdminUser() {
  const qc = useQueryClient()
  return useMutation<{ ok: true }, unknown, string>({
    mutationFn: (userId) => http.del(`/admin/users/${userId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })
}
