'use client'

import { useQuery } from '@tanstack/react-query'
import { createResourceHooks } from '@/lib/api/hooks/create-resource-hooks'
import { queryKeys } from '@/lib/api/query-keys'
import { http } from '@/lib/api/http'
import { useActiveWorkspace } from '@/lib/api/workspace-context'
import type { ProductOutputDTO } from '@/lib/dto/product.dto'
import type {
  ProductListQuery,
  ProductCreateInput,
  ProductUpdateInput,
} from '@/lib/validation/product.schema'

const productHooks = createResourceHooks<
  ProductOutputDTO,
  ProductListQuery,
  ProductCreateInput,
  ProductUpdateInput
>({ path: '/products', keys: queryKeys.products })

/** Products CRUD — real data from `/api/v1/products`, replacing `mockProducts`. */
export const useProducts = productHooks.useList
export const useProductsInfinite = productHooks.useInfiniteList
export const useProduct = productHooks.useDetail
export const useDeletedProducts = productHooks.useDeletedList
export const useCreateProduct = productHooks.useCreate
export const useUpdateProduct = productHooks.useUpdate
export const useDeleteProduct = productHooks.useRemove
export const useRestoreProduct = productHooks.useRestore

/** Distinct product categories for the frozen products filter. */
export function useProductCategories() {
  const workspaceId = useActiveWorkspace()
  return useQuery<{ categories: string[] }>({
    queryKey: queryKeys.products.categories,
    queryFn: ({ signal }) => http.get('/products/categories', { workspaceId, signal }),
    enabled: Boolean(workspaceId),
  })
}
