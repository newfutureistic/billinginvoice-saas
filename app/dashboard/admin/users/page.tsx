'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { DataTable } from '@/components/dashboard/dashboard-cards'
import { useAdminUsers } from '@/lib/api/hooks/use-admin-users'
import { ApiError } from '@/lib/api/errors'

export default function AdminUsersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const { data, isPending, isError, error } = useAdminUsers({ page })

  const rows = useMemo(() => {
    const users = data?.items ?? []
    const q = search.trim().toLowerCase()
    return users
      .filter((u) => !q || (u.name ?? '').toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
      .map((u) => ({
        name: u.name || u.email.split('@')[0],
        email: u.email,
        invoiceCount: u.invoiceCount,
        verified: u.emailVerified ? 'Verified' : 'Not verified',
        joinedDate: new Date(u.createdAt).toLocaleDateString(),
      }))
  }, [data, search])

  const forbidden = error instanceof ApiError && (error.status === 403 || error.code === 'FORBIDDEN')

  return (
    <div className="space-y-6 p-6 sm:p-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">All Users</h1>
        <p className="mt-2 text-muted-foreground">
          Every account on the platform, and how many invoices each one has created.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border p-4">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
            <Search className="size-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="flex-1 bg-transparent outline-none text-sm"
            />
          </div>
        </div>

        {isPending ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading users…</div>
        ) : isError ? (
          <div className="p-8 text-center text-sm text-destructive">
            {forbidden
              ? "This page is restricted to site administrators."
              : 'Could not load users.'}
          </div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            {search ? 'No users match your search.' : 'No users yet.'}
          </div>
        ) : (
          <DataTable
            columns={[
              { key: 'name', label: 'Name' },
              { key: 'email', label: 'Email' },
              {
                key: 'invoiceCount',
                label: 'Invoices Created',
                render: (value) => <span className="font-semibold text-foreground">{String(value)}</span>,
              },
              { key: 'verified', label: 'Status' },
              { key: 'joinedDate', label: 'Joined' },
            ]}
            data={rows}
          />
        )}

        {data && data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border p-4 text-sm">
            <span className="text-muted-foreground">
              Page {data.pagination.page} of {data.pagination.totalPages} · {data.pagination.total} users
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
