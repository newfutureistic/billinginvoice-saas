'use client'

import { useState } from 'react'
import { useDocuments } from '@/lib/api/hooks/use-documents'
import { DataTable, StatusBadge, EmptyState } from '@/components/dashboard/dashboard-cards'
import { Plus, Search, FileText } from 'lucide-react'
import Link from 'next/link'
import type { DocumentOutputDTO } from '@/lib/dto/document.dto'

function recipientName(r: unknown): string {
  if (r && typeof r === 'object' && !Array.isArray(r)) {
    const o = r as Record<string, unknown>
    const n = o.clientName ?? o.name ?? o.businessName
    if (typeof n === 'string' && n.trim()) return n
  }
  return '—'
}

export default function InvoicesPage() {
  const [search, setSearch] = useState('')
  const { data, isPending, isError } = useDocuments()
  const all = data?.items ?? []
  const q = search.trim().toLowerCase()
  const invoices = q
    ? all.filter((d) => [d.number, recipientName(d.recipient), d.status].some((f) => f.toLowerCase().includes(q)))
    : all

  return (
    <div className="space-y-6 p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Invoices</h1>
          <p className="mt-2 text-muted-foreground">Manage and track all your invoices.</p>
        </div>
        <Link
          href="/invoice/new"
          className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 font-medium text-brand-foreground hover:bg-brand/90"
        >
          <Plus className="size-5" />
          Create Invoice
        </Link>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border p-4">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
            <Search className="size-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search invoices..."
              className="flex-1 bg-transparent outline-none text-sm"
            />
          </div>
        </div>

        {isPending ? (
          <div className="p-4 space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-muted/40" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-sm text-destructive">Could not load invoices.</div>
        ) : invoices.length === 0 ? (
          <EmptyState
            icon={<FileText className="size-8" />}
            title={q ? 'No matching invoices' : 'No invoices yet'}
            description={q ? 'Try a different search.' : 'Create your first invoice to see it here.'}
            action={q ? undefined : { label: 'Create Invoice', href: '/invoice/new' }}
          />
        ) : (
          <DataTable
            columns={[
              { key: 'number', label: 'Invoice No.' },
              { key: 'recipient', label: 'Client', render: (v) => recipientName(v) },
              {
                key: 'total',
                label: 'Amount',
                render: (value, row: DocumentOutputDTO) =>
                  `${row.currency} ${(value as number).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              },
              { key: 'status', label: 'Status', render: (value) => <StatusBadge status={value as string} /> },
              { key: 'issueDate', label: 'Date', render: (v) => new Date(v as string).toLocaleDateString() },
              {
                key: 'id',
                label: 'Action',
                render: (value) => (
                  <Link href={`/dashboard/invoices/${value}`} className="text-brand hover:underline">
                    View
                  </Link>
                ),
              },
            ]}
            data={invoices}
          />
        )}
      </div>
    </div>
  )
}
