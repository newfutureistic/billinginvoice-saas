'use client'

import { mockClients, mockInvoices } from '@/lib/dashboard-data'
import { DataTable, StatusBadge } from '@/components/dashboard/dashboard-cards'
import { ArrowLeft, Edit2, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ClientDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const client = mockClients.find((c) => c.id === params.id)
  const clientInvoices = mockInvoices.filter((i) => i.client === client?.name)

  if (!client) {
    return (
      <div className="flex items-center justify-center p-6 sm:p-8 min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Client Not Found</h1>
          <p className="mt-2 text-muted-foreground">The client you're looking for doesn't exist.</p>
          <Link
            href="/dashboard/clients"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 font-medium text-brand-foreground hover:bg-brand/90"
          >
            <ArrowLeft className="size-4" />
            Back to Clients
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-brand hover:underline"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>
        <div className="flex gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 font-medium hover:bg-muted">
            <Edit2 className="size-4" />
            Edit
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-2 font-medium text-destructive hover:bg-destructive/20">
            <Trash2 className="size-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Header */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-token-xs">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">{client.name}</h1>
                <StatusBadge status={client.status} />
              </div>
            </div>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">Email</p>
                <p className="mt-2 text-foreground">{client.email}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">Phone</p>
                <p className="mt-2 text-foreground">{client.phone}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Address</p>
                <p className="mt-2 text-foreground">{client.address}</p>
              </div>
            </div>
          </div>

          {/* Invoices */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-token-xs">
            <h2 className="mb-6 text-lg font-semibold text-foreground">Invoices</h2>
            {clientInvoices.length === 0 ? (
              <p className="text-muted-foreground">No invoices for this client.</p>
            ) : (
              <DataTable
                columns={[
                  { key: 'number', label: 'Invoice No.' },
                  {
                    key: 'amount',
                    label: 'Amount',
                    render: (value) => `$${value}`,
                  },
                  {
                    key: 'status',
                    label: 'Status',
                    render: (value) => <StatusBadge status={value as string} />,
                  },
                  { key: 'date', label: 'Date' },
                ]}
                data={clientInvoices}
              />
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 shadow-token-xs">
            <h3 className="mb-6 text-lg font-semibold text-foreground">Summary</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">Total Spent</p>
                <p className="mt-2 text-2xl font-bold text-foreground">${client.totalSpent}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">Invoices</p>
                <p className="mt-2 text-2xl font-bold text-foreground">{client.invoiceCount}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">Status</p>
                <div className="mt-2">
                  <StatusBadge status={client.status} />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-token-xs">
            <h3 className="mb-4 text-lg font-semibold text-foreground">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                href="/invoice/new"
                className="block rounded-lg border border-border px-3 py-2 text-sm text-center hover:bg-muted"
              >
                Create Invoice
              </Link>
              <button className="w-full rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted">
                Send Invoice
              </button>
              <button className="w-full rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted">
                Record Payment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
