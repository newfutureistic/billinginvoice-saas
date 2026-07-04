'use client'

import { createResourceHooks } from '@/lib/api/hooks/create-resource-hooks'
import { queryKeys } from '@/lib/api/query-keys'
import type { ClientOutputDTO } from '@/lib/dto/client.dto'
import type {
  ClientListQuery,
  ClientCreateInput,
  ClientUpdateInput,
} from '@/lib/validation/client.schema'

const clientHooks = createResourceHooks<
  ClientOutputDTO,
  ClientListQuery,
  ClientCreateInput,
  ClientUpdateInput
>({ path: '/clients', keys: queryKeys.clients })

/** Clients CRUD — real data from `/api/v1/clients`, replacing `mockClients`. */
export const useClients = clientHooks.useList
export const useClientsInfinite = clientHooks.useInfiniteList
export const useClient = clientHooks.useDetail
export const useDeletedClients = clientHooks.useDeletedList
export const useCreateClient = clientHooks.useCreate
export const useUpdateClient = clientHooks.useUpdate
export const useDeleteClient = clientHooks.useRemove
export const useRestoreClient = clientHooks.useRestore
