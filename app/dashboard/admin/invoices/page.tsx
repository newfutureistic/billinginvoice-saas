'use client'

import { useMemo, useState } from 'react'
import { Download, Search } from 'lucide-react'
import { DataTable } from '@/components/dashboard/dashboard-cards'
import { useAdminInvoices, openAdminInvoiceDownload } from '@/lib/api/hooks/use-admin-invoices'
import { ApiError } from '@/lib/api/errors'

export default function AdminInvoicesPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const { data, isPending, isError, error } = useAdminInvoices({ page })
  const [downloadError, setDownloadError] = useState<string | null>(null)

  const rows = useMemo(() => {
    const invoices = data?.items ?? []
    const q = search.trim().toLowerCase()
    return invoices
      .filter(
        (i) =>
          !q ||
          (i.invoiceNumber ?? '').toLowerCase().includes(q) ||
          (i.businessName ?? '').toLowerCase().includes(q) ||
          (i.clientName ?? '').toLowerCase().includes(q) ||
          (i.user?.email ?? '').toLowerCase().includes(q),
      )
      .map((i) => ({
        id: i.id,
        source: i.source,
        invoiceNumber: i.invoiceNumber || '—',
        businessName: i.businessName || '—',
        clientName: i.clientName || '—',
        who: i.user ? i.user.name || i.user.email : 'Guest (no account)',
        workspace: i.workspace?.name ?? '—',
        amount: i.total !== null && i.currency ? `${i.currency} ${i.total.toFixed(2)}` : '—',
        date: new Date(i.createdAt).toLocaleDateString(),
        hasPdf: i.hasPdf,
      }))
  }, [data, search])

  const forbidden = error instanceof ApiError && (error.status === 403 || error.code === 'FORBIDDEN')

  async function handleDownload(id: string, source: 'dashboard' | 'builder') {
    setDownloadError(null)
    try {
      await openAdminInvoiceDownload(id, source)
    } catch (err) {
      setDownloadError(err instanceof ApiError ? err.message : 'Could not download this invoice.')
    }
  }

  return (
    <div className="space-y-6 p-6 sm:p-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">All Invoices</h1>
        <p className="mt-2 text-muted-foreground">
          Every invoice PDF on the platform — saved account invoices and downloads from the free builder, guest or signed in.
        </p>
      </div>

      {downloadError && (
        <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-2 text-sm text-destructive" role="alert">
          {downloadError}
        </p>
      )}

      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border p-4">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
            <Search className="size-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search invoice #, business, client, or email..."
              className="flex-1 bg-transparent outline-none text-sm"
            />
          </div>
        </div>

        {isPending ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading invoices…</div>
        ) : isError ? (
          <div className="p-8 text-center text-sm text-destructive">
            {forbidden ? 'This page is restricted to site administrators.' : 'Could not load invoices.'}
          </div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            {search ? 'No invoices match your search.' : 'No invoices yet.'}
          </div>
        ) : (
          <DataTable
            columns={[
              {
                key: 'source',
                label: 'Source',
                render: (value) => (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      value === 'dashboard' ? 'bg-brand-muted text-brand' : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    {value === 'dashboard' ? 'Account' : 'Builder'}
                  </span>
                ),
              },
              { key: 'invoiceNumber', label: 'Invoice #' },
              { key: 'businessName', label: 'Business' },
              { key: 'clientName', label: 'Client' },
              { key: 'who', label: 'User' },
              { key: 'workspace', label: 'Workspace' },
              { key: 'amount', label: 'Amount' },
              { key: 'date', label: 'Date' },
              {
                key: 'id',
                label: '',
                render: (_value, row) => (
                  <button
                    type="button"
                    onClick={() => handleDownload(row.id, row.source)}
                    disabled={!row.hasPdf}
                    title={row.hasPdf ? 'Download PDF' : 'No PDF generated yet'}
                    className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-brand/10 hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                ),
              },
            ]}
            data={rows}
          />
        )}

        {data && data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border p-4 text-sm">
            <span className="text-muted-foreground">
              Page {data.pagination.page} of {data.pagination.totalPages} · {data.pagination.total} invoices
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!data.pagination.hasPrev}
                className="rounded-lg border border-border px-3 py-1.5 font-medium text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!data.pagination.hasNext}
                className="rounded-lg border border-border px-3 py-1.5 font-medium text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
