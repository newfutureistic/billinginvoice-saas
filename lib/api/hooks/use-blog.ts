'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { http } from '@/lib/api/http'
import { useActiveWorkspace } from '@/lib/api/workspace-context'
import type { BlogPostDTO, BlogListItemDTO } from '@/lib/dto/blog.dto'
import type { BlogCreateInput, BlogUpdateInput } from '@/lib/validation/blog.schema'

interface Paginated<T> {
  items: T[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

const blogKey = ['blog', 'admin'] as const

/** Admin blog listing (all statuses, incl. soft-deleted). */
export function useAdminBlogPosts(params: { page?: number; status?: string; q?: string } = {}) {
  const workspaceId = useActiveWorkspace()
  const qs = new URLSearchParams()
  if (params.page) qs.set('page', String(params.page))
  if (params.status) qs.set('status', params.status)
  if (params.q) qs.set('q', params.q)
  const suffix = qs.toString() ? `?${qs}` : ''
  return useQuery<Paginated<BlogListItemDTO>>({
    queryKey: [...blogKey, params],
    queryFn: ({ signal }) => http.get(`/blog${suffix}`, { workspaceId, signal }),
    enabled: Boolean(workspaceId),
  })
}

export function useCreateBlog() {
  const qc = useQueryClient()
  const workspaceId = useActiveWorkspace()
  return useMutation<BlogPostDTO, unknown, BlogCreateInput>({
    mutationFn: (body) => http.post('/blog', body, { workspaceId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: blogKey }),
  })
}

export function useUpdateBlog() {
  const qc = useQueryClient()
  const workspaceId = useActiveWorkspace()
  return useMutation<BlogPostDTO, unknown, { id: string; data: BlogUpdateInput }>({
    mutationFn: ({ id, data }) => http.patch(`/blog/${id}`, data, { workspaceId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: blogKey }),
  })
}

export function useDeleteBlog() {
  const qc = useQueryClient()
  const workspaceId = useActiveWorkspace()
  return useMutation<BlogPostDTO, unknown, string>({
    mutationFn: (id) => http.del(`/blog/${id}`, { workspaceId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: blogKey }),
  })
}

export function useRestoreBlog() {
  const qc = useQueryClient()
  const workspaceId = useActiveWorkspace()
  return useMutation<BlogPostDTO, unknown, string>({
    mutationFn: (id) => http.post(`/blog/${id}/restore`, {}, { workspaceId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: blogKey }),
  })
}
