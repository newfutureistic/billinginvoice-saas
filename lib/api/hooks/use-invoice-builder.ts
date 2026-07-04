'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useClients } from '@/lib/api/hooks/use-clients'
import { useProducts } from '@/lib/api/hooks/use-products'
import { useTemplates } from '@/lib/api/hooks/use-templates'
import { useWorkspaceSettings } from '@/lib/api/hooks/use-workspaces'
import {
  useCreateDocument,
  useUpdateDocument,
  useDeleteDocument,
  useDocument,
} from '@/lib/api/hooks/use-documents'
import { useDebouncedValue } from '@/lib/api/use-debounce'
import type { DocumentCreateInput } from '@/lib/validation/document.schema'
import type { DocumentDetailDTO } from '@/lib/dto/document.dto'

/**
 * Invoice-builder data — real clients, products, templates and workspace settings for the
 * frozen builder, replacing the invoice mock data. One hook loads everything the builder
 * needs (and honors workspace numbering/branding via settings).
 */
export function useInvoiceBuilderData() {
  return {
    clients: useClients({ page: 1, pageSize: 100 } as never),
    products: useProducts({ page: 1, pageSize: 100 } as never),
    templates: useTemplates({ page: 1, pageSize: 50 }),
    settings: useWorkspaceSettings(),
  }
}

/**
 * Draft lifecycle for the builder: save (create-then-update), autosave (debounced),
 * update, and delete. The server allocates the real document number on first save.
 */
export function useInvoiceDraft(existingId?: string) {
  const [draftId, setDraftId] = useState<string | undefined>(existingId)
  const create = useCreateDocument()
  const update = useUpdateDocument()
  const remove = useDeleteDocument()
  const loaded = useDocument(draftId)

  const save = useCallback(
    async (input: DocumentCreateInput): Promise<DocumentDetailDTO> => {
      if (draftId) {
        return update.mutateAsync({ id: draftId, input })
      }
      const created = await create.mutateAsync(input)
      setDraftId(created.id)
      return created
    },
    [draftId, create, update],
  )

  const discard = useCallback(async () => {
    if (draftId) await remove.mutateAsync({ id: draftId })
    setDraftId(undefined)
  }, [draftId, remove])

  return {
    draftId,
    draft: loaded.data,
    save,
    discard,
    isSaving: create.isPending || update.isPending,
    isLoading: loaded.isLoading,
  }
}

/**
 * Autosave: debounce the builder's draft input and persist it in the background. Skips the
 * initial mount so opening the builder doesn't immediately create an empty draft.
 */
export function useInvoiceAutosave(
  input: DocumentCreateInput | null,
  save: (input: DocumentCreateInput) => Promise<unknown>,
  { delayMs = 2000, enabled = true }: { delayMs?: number; enabled?: boolean } = {},
) {
  const debounced = useDebouncedValue(input, delayMs)
  const firstRun = useRef(true)

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false
      return
    }
    if (enabled && debounced) void save(debounced)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced, enabled])
}
