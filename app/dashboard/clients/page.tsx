'use client'

import { useState } from 'react'
import { useClients } from '@/lib/api/hooks/use-clients'
import { DataTable, StatusBadge, EmptyState } from '@/components/dashboard/dashboard-cards'
import { Plus, Search, Users } from 'lucide-react'
import Link from 'next/link'

export default function ClientsPage() {
  const [search, setSearch] = useState('')
  const { data, isPending, isError } = useClients()
  const all = data?.items ?? []
  const q = search.trim().toLowerCase()
  const clients = q
    ? all.filter((c) => [c.name, c.email, c.phone].some((f) => f?.toLowerCase().includes(q)))
    : all

  return (
    <div className="space-y-6 p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Clients</h1>
          <p className="mt-2 text-muted-foreground">Manage your client information and history.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 font-medium text-brand-foreground hover:bg-brand/90">
          <Plus className="size-5" />
          Add Client
        </button>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border p-4">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
            <Search className="size-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clients..."
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
          <div className="p-8 text-center text-sm text-destructive">Could not load clients.</div>
        ) : clients.length === 0 ? (
          <EmptyState
            icon={<Users className="size-8" />}
            title={q ? 'No matching clients' : 'No clients yet'}
            description={q ? 'Try a different search.' : 'Your clients will appear here once you add them.'}
          />
        ) : (
          <DataTable
            columns={[
              { key: 'name', label: 'Name' },
              { key: 'email', label: 'Email', render: (v) => (v as string) || '—' },
              { key: 'phone', label: 'Phone', render: (v) => (v as string) || '—' },
              { key: 'status', label: 'Status', render: (value) => <StatusBadge status={value as string} /> },
              {
                key: 'id',
                label: 'Action',
                render: (value) => (
                  <Link href={`/dashboard/clients/${value}`} className="text-brand hover:underline">
                    View
                  </Link>
                ),
              },
            ]}
            data={clients}
          />
        )}
      </div>
    </div>
  )
}
