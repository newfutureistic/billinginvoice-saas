'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createResourceHooks } from '@/lib/api/hooks/create-resource-hooks'
import { queryKeys } from '@/lib/api/query-keys'
import { http } from '@/lib/api/http'
import { useActiveWorkspace } from '@/lib/api/workspace-context'
import type { DocumentOutputDTO, DocumentDetailDTO } from '@/lib/dto/document.dto'
import type {
  DocumentListQuery,
  DocumentCreateInput,
  DocumentUpdateInput,
} from '@/lib/validation/document.schema'

const documentHooks = createResourceHooks<
  DocumentOutputDTO,
  DocumentListQuery,
  DocumentCreateInput,
  DocumentUpdateInput,
  DocumentDetailDTO
>({ path: '/documents', keys: queryKeys.documents })

/**
 * Documents CRUD — the generic engine for every type (invoice, quote, receipt, PO, …),
 * replacing `mockInvoices`. `useInvoices` is a thin convenience over `useDocuments`.
 */
export const useDocuments = documentHooks.useList
export const useDocumentsInfinite = documentHooks.useInfiniteList
export const useDocument = documentHooks.useDetail
export const useDeletedDocuments = documentHooks.useDeletedList
export const useCreateDocument = documentHooks.useCreate
export const useUpdateDocument = documentHooks.useUpdate
export const useDeleteDocument = documentHooks.useRemove
export const useRestoreDocument = documentHooks.useRestore

/** Invoices = documents filtered to type INVOICE (frozen invoices list). */
export function useInvoices(query?: Omit<DocumentListQuery, 'type'>) {
  return useDocuments({ ...(query as DocumentListQuery), type: 'INVOICE' })
}

/** Transition a document's status (send → SENT, mark paid → PAID, …). */
export function useSetDocumentStatus() {
  const qc = useQueryClient()
  const workspaceId = useActiveWorkspace()
  return useMutation<DocumentDetailDTO, unknown, { id: string; status: string }>({
    mutationFn: ({ id, status }) =>
      http.patch<DocumentDetailDTO>(`/documents/${id}/status`, { status }, { workspaceId }),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.documents.detail(id) })
      qc.invalidateQueries({ queryKey: queryKeys.documents.all })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
