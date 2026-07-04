'use client'

import { mockClients } from '@/lib/dashboard-data'
import { DataTable, StatusBadge } from '@/components/dashboard/dashboard-cards'
import { Plus, Search } from 'lucide-react'
import Link from 'next/link'

export default function ClientsPage() {
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
              placeholder="Search clients..."
              className="flex-1 bg-transparent outline-none text-sm"
            />
          </div>
        </div>

        <DataTable
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'email', label: 'Email' },
            {
              key: 'totalSpent',
              label: 'Total Spent',
              render: (value) => `$${value}`,
            },
            {
              key: 'invoiceCount',
              label: 'Invoices',
            },
            {
              key: 'status',
              label: 'Status',
              render: (value) => <StatusBadge status={value as string} />,
            },
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
          data={mockClients}
        />
      </div>
    </div>
  )
}
