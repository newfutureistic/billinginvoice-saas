'use client'

import { useEffect, useState } from 'react'
import { InvoiceBuilder } from '@/components/invoice/invoice-builder'
import { useDocument } from '@/lib/api/hooks/use-documents'
import { useWorkspaceBootstrap } from '@/lib/api/hooks/use-workspace-bootstrap'
import { documentToInvoiceData } from '@/lib/invoice-document'
import { readDraft } from '@/lib/invoice-draft-storage'

/**
 * Invoice builder entry.
 *  - `/invoice/new`               → a fresh invoice
 *  - `/invoice/new?id=<docId>`    → open an existing invoice to continue editing (updates it)
 *  - `/invoice/new?duplicate=<id>`→ open a copy that saves as a NEW invoice (new number)
 */
export default function NewInvoicePage() {
  useWorkspaceBootstrap()
  const [params, setParams] = useState<{ id?: string; duplicate?: string } | null>(null)

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search)
    setParams({ id: sp.get('id') ?? undefined, duplicate: sp.get('duplicate') ?? undefined })
  }, [])

  const sourceId = params?.id ?? params?.duplicate
  const doc = useDocument(sourceId)

  // Fresh invoice — recover an unsaved local draft if one exists.
  if (params && !sourceId) {
    const recovered = readDraft()
    return <InvoiceBuilder initialInvoice={recovered ?? undefined} />
  }

  if (!params || doc.isPending) {
    return <div className="flex h-screen items-center justify-center text-muted-foreground">Loading invoice…</div>
  }
  if (doc.isError || !doc.data) {
    return <div className="flex h-screen items-center justify-center text-destructive">Could not load this invoice.</div>
  }

  const initial = documentToInvoiceData(doc.data)
  if (params.duplicate) {
    // Copy: drop the id/number so the next save creates a new document.
    return <InvoiceBuilder initialInvoice={{ ...initial, id: '', invoiceNumber: '' }} />
  }
  return <InvoiceBuilder invoiceId={params.id} initialInvoice={initial} />
}
