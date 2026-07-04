'use client'

import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query'
import { http, type QueryParams } from '@/lib/api/http'
import type { ListResult } from '@/lib/api/errors'
import { useActiveWorkspace } from '@/lib/api/workspace-context'

/**
 * Generic tenant-resource hook factory — the reason the frontend has **zero duplicated
 * fetching logic**. Given a base path + query-key set, it produces the entire hook suite
 * (list, infinite list, detail, deleted list, create, optimistic update, soft/permanent
 * delete, restore) with consistent cache invalidation. Clients / products / documents /
 * templates are thin wrappers over this.
 */
export interface ResourceKeys {
  all: readonly unknown[]
  list: (q?: unknown) => readonly unknown[]
  infinite: (q?: unknown) => readonly unknown[]
  detail: (id: string) => readonly unknown[]
  deleted: (q?: unknown) => readonly unknown[]
}

export interface ResourceConfig {
  path: string
  keys: ResourceKeys
}

export function createResourceHooks<
  DTO extends { id: string },
  Query extends QueryParams = QueryParams,
  CreateInput = unknown,
  UpdateInput = unknown,
  DetailDTO extends { id: string } = DTO,
>(config: ResourceConfig) {
  const { path, keys } = config

  function useList(query?: Query, options?: Partial<UseQueryOptions<ListResult<DTO>>>) {
    const workspaceId = useActiveWorkspace()
    return useQuery<ListResult<DTO>>({
      queryKey: keys.list(query),
      queryFn: ({ signal }) => http.get<ListResult<DTO>>(path, { query, workspaceId, signal }),
      placeholderData: keepPreviousData,
      enabled: Boolean(workspaceId),
      ...options,
    })
  }

  function useInfiniteList(query?: Query, pageSize = 20) {
    const workspaceId = useActiveWorkspace()
    return useInfiniteQuery({
      queryKey: keys.infinite(query),
      queryFn: ({ pageParam, signal }) =>
        http.get<ListResult<DTO>>(path, {
          query: { ...query, page: pageParam, pageSize },
          workspaceId,
          signal,
        }),
      initialPageParam: 1,
      getNextPageParam: (last) =>
        last.pagination.hasNext ? last.pagination.page + 1 : undefined,
      enabled: Boolean(workspaceId),
    })
  }

  function useDetail(id: string | undefined) {
    const workspaceId = useActiveWorkspace()
    return useQuery<DetailDTO>({
      queryKey: keys.detail(id ?? ''),
      queryFn: ({ signal }) => http.get<DetailDTO>(`${path}/${id}`, { workspaceId, signal }),
      enabled: Boolean(workspaceId) && Boolean(id),
    })
  }

  function useDeletedList(query?: Query) {
    const workspaceId = useActiveWorkspace()
    return useQuery<ListResult<DTO>>({
      queryKey: keys.deleted(query),
      queryFn: ({ signal }) => http.get<ListResult<DTO>>(`${path}/deleted`, { query, workspaceId, signal }),
      enabled: Boolean(workspaceId),
    })
  }

  function useCreate() {
    const qc = useQueryClient()
    const workspaceId = useActiveWorkspace()
    return useMutation<DetailDTO, unknown, CreateInput>({
      mutationFn: (input) => http.post<DetailDTO>(path, input, { workspaceId }),
      onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
    })
  }

  /** Optimistic update: patches the cached detail immediately, rolls back on error. */
  function useUpdate() {
    const qc = useQueryClient()
    const workspaceId = useActiveWorkspace()
    return useMutation<DetailDTO, unknown, { id: string; input: UpdateInput }, { prev?: DetailDTO }>({
      mutationFn: ({ id, input }) => http.patch<DetailDTO>(`${path}/${id}`, input, { workspaceId }),
      onMutate: async ({ id, input }) => {
        await qc.cancelQueries({ queryKey: keys.detail(id) })
        const prev = qc.getQueryData<DetailDTO>(keys.detail(id))
        if (prev) qc.setQueryData<DetailDTO>(keys.detail(id), { ...prev, ...(input as Partial<DetailDTO>) })
        return { prev }
      },
      onError: (_err, { id }, ctx) => {
        if (ctx?.prev) qc.setQueryData(keys.detail(id), ctx.prev)
      },
      onSettled: (_data, _err, { id }) => {
        qc.invalidateQueries({ queryKey: keys.detail(id) })
        qc.invalidateQueries({ queryKey: keys.all })
      },
    })
  }

  function useRemove() {
    const qc = useQueryClient()
    const workspaceId = useActiveWorkspace()
    return useMutation<{ ok: true }, unknown, { id: string; permanent?: boolean }>({
      mutationFn: ({ id, permanent }) =>
        http.del<{ ok: true }>(`${path}/${id}`, { query: { permanent }, workspaceId }),
      onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
    })
  }

  function useRestore() {
    const qc = useQueryClient()
    const workspaceId = useActiveWorkspace()
    return useMutation<DetailDTO, unknown, string>({
      mutationFn: (id) => http.post<DetailDTO>(`${path}/${id}/restore`, undefined, { workspaceId }),
      onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
    })
  }

  return {
    useList,
    useInfiniteList,
    useDetail,
    useDeletedList,
    useCreate,
    useUpdate,
    useRemove,
    useRestore,
  }
}
