'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/api/query-keys'
import { http } from '@/lib/api/http'
import type { ListResult } from '@/lib/api/errors'
import { useActiveWorkspace } from '@/lib/api/workspace-context'
import type { TemplateOutputDTO, TemplatePreviewDTO } from '@/lib/dto/template.dto'
import type {
  TemplateCreateInput,
  TemplateUpdateInput,
  DuplicateTemplateInput,
} from '@/lib/validation/template.schema'
import type { PaginationQuery } from '@/lib/validation/common.schema'

/**
 * Invoice templates — real data from `/api/v1/templates`, replacing `mockTemplates`.
 * Templates have no soft-delete (deletion is permanent), so this is a bespoke hook set
 * (list / detail / preview / create / update / delete / duplicate / set-default).
 */
export function useTemplates(query?: PaginationQuery) {
  const workspaceId = useActiveWorkspace()
  return useQuery<ListResult<TemplateOutputDTO>>({
    queryKey: queryKeys.templates.list(query),
    queryFn: ({ signal }) => http.get('/templates', { query, workspaceId, signal }),
    enabled: Boolean(workspaceId),
  })
}

export function useTemplate(id: string | undefined) {
  const workspaceId = useActiveWorkspace()
  return useQuery<TemplateOutputDTO>({
    queryKey: queryKeys.templates.detail(id ?? ''),
    queryFn: ({ signal }) => http.get(`/templates/${id}`, { workspaceId, signal }),
    enabled: Boolean(workspaceId) && Boolean(id),
  })
}

export function useTemplatePreview(id: string | undefined) {
  const workspaceId = useActiveWorkspace()
  return useQuery<TemplatePreviewDTO>({
    queryKey: queryKeys.templates.preview(id ?? ''),
    queryFn: ({ signal }) => http.get(`/templates/${id}/preview`, { workspaceId, signal }),
    enabled: Boolean(workspaceId) && Boolean(id),
  })
}

function useTemplateInvalidate() {
  const qc = useQueryClient()
  return () => qc.invalidateQueries({ queryKey: queryKeys.templates.all })
}

export function useCreateTemplate() {
  const invalidate = useTemplateInvalidate()
  const workspaceId = useActiveWorkspace()
  return useMutation<TemplateOutputDTO, unknown, TemplateCreateInput>({
    mutationFn: (input) => http.post('/templates', input, { workspaceId }),
    onSuccess: invalidate,
  })
}

export function useUpdateTemplate() {
  const invalidate = useTemplateInvalidate()
  const workspaceId = useActiveWorkspace()
  return useMutation<TemplateOutputDTO, unknown, { id: string; input: TemplateUpdateInput }>({
    mutationFn: ({ id, input }) => http.patch(`/templates/${id}`, input, { workspaceId }),
    onSuccess: invalidate,
  })
}

export function useDeleteTemplate() {
  const invalidate = useTemplateInvalidate()
  const workspaceId = useActiveWorkspace()
  return useMutation<{ ok: true }, unknown, string>({
    mutationFn: (id) => http.del(`/templates/${id}`, { workspaceId }),
    onSuccess: invalidate,
  })
}

export function useDuplicateTemplate() {
  const invalidate = useTemplateInvalidate()
  const workspaceId = useActiveWorkspace()
  return useMutation<TemplateOutputDTO, unknown, { id: string; input?: DuplicateTemplateInput }>({
    mutationFn: ({ id, input }) => http.post(`/templates/${id}/duplicate`, input ?? {}, { workspaceId }),
    onSuccess: invalidate,
  })
}

export function useSetDefaultTemplate() {
  const invalidate = useTemplateInvalidate()
  const workspaceId = useActiveWorkspace()
  return useMutation<TemplateOutputDTO, unknown, string>({
    mutationFn: (id) => http.post(`/templates/${id}/default`, undefined, { workspaceId }),
    onSuccess: invalidate,
  })
}
