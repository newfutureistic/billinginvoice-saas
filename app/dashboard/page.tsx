'use client'

import { useEffect, useState } from 'react'
import { KPICard } from '@/components/dashboard/dashboard-cards'
import { useDashboard } from '@/lib/api/hooks/use-dashboard'
import { useSession } from 'next-auth/react'
import { DollarSign, FileText, Users, Package, Loader2, RefreshCw, ShieldCheck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import Link from 'next/link'

const KPI_ICONS: Record<string, LucideIcon> = {
  revenue: DollarSign,
  invoices: FileText,
  clients: Users,
  products: Package,
}

function recipientName(r: unknown): string {
  if (r && typeof r === 'object' && !Array.isArray(r)) {
    const o = r as Record<string, unknown>
    const n = o.clientName ?? o.name ?? o.businessName
    if (typeof n === 'string' && n.trim()) return n
  }
  return '—'
}

function money(n: number, currency = 'USD'): string {
  return `${currency} ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function statusColor(status: string): string {
  const s = status.toLowerCase()
  if (s === 'paid') return 'text-success'
  if (s === 'sent') return 'text-brand'
  if (s === 'overdue') return 'text-destructive'
  return 'text-muted-foreground'
}

export default function DashboardOverview() {
  const { data: session } = useSession()
  const { data, isPending, isError, isFetching, refetch } = useDashboard(6)
  const firstName = session?.user?.name?.split(' ')[0] ?? 'there'

  // Auto-recover from a transient hiccup (a brief connection blip, or the workspace still
  // settling right after sign-in). We quietly retry a few times before asking the user to act,
  // so the common case fixes itself without anyone seeing a scary error.
  const [autoTries, setAutoTries] = useState(0)
  useEffect(() => {
    if (isError && autoTries < 4) {
      const t = setTimeout(() => {
        setAutoTries((n) => n + 1)
        void refetch()
      }, 2500)
      return () => clearTimeout(t)
    }
  }, [isError, autoTries, refetch])
  useEffect(() => {
    if (data) setAutoTries(0)
  }, [data])

  if (isError) {
    const stillTrying = autoTries < 4
    return (
      <div className="space-y-8 p-6 sm:p-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        </div>
        <div className="rounded-2xl border border-border bg-card p-10 text-center shadow-token-xs">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-brand-muted text-brand">
            {stillTrying ? <Loader2 className="size-6 animate-spin" /> : <ShieldCheck className="size-6" />}
          </div>
          <h2 className="mt-4 text-lg font-semibold text-foreground">
            {stillTrying ? 'Reconnecting to your workspace…' : 'Just need a quick refresh'}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
            {stillTrying
              ? 'We’re securely loading your data. This is usually a brief connection hiccup and clears on its own — no action needed.'
              : 'We couldn’t reach your data just now. Your information is safe and nothing was lost — please refresh to continue.'}
          </p>
          <button
            onClick={() => {
              setAutoTries(0)
              void refetch()
            }}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-foreground transition-colors hover:bg-brand/90"
          >
            <RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>
    )
  }

  if (isPending || !data) {
    return (
      <div className="space-y-8 p-6 sm:p-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Loading your business overview…</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl border border-border bg-card" />
          ))}
        </div>
        <div className="h-72 animate-pulse rounded-xl border border-border bg-card" />
      </div>
    )
  }

  const recentInvoices = data.recentDocuments.slice(0, 5)
  const recentActivity = data.recentActivity.slice(0, 4)
  const totals = data.totals
  const revenueKpi = data.kpis.find((k) => k.id === 'revenue')
  const maxRevenue = Math.max(1, ...data.revenue.map((d) => d.revenue))
  const pending = data.statusBreakdown
    .filter((s) => s.status.toLowerCase() !== 'paid')
    .reduce((n, s) => n + s.count, 0)
  const overdue = data.statusBreakdown.find((s) => s.status.toLowerCase() === 'overdue')?.count ?? 0

  return (
    <div className="space-y-8 p-6 sm:p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">Welcome back, {firstName}. Here&apos;s what&apos;s happening with your business.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {data.kpis.map((kpi) => (
          <KPICard key={kpi.id} kpi={{ ...kpi, icon: KPI_ICONS[kpi.id] ?? DollarSign }} />
        ))}
      </div>

      {/* Charts and Data Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Chart */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-token-xs lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Revenue Trend</h2>
            <select className="rounded-lg border border-border bg-muted px-3 py-2 text-sm">
              <option>Last 6 months</option>
              <option>Last year</option>
              <option>All time</option>
            </select>
          </div>
          {data.revenue.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
              No revenue data yet.
            </div>
          ) : (
            <div className="flex h-64 items-end justify-between gap-2">
              {data.revenue.map((item) => {
                const height = (item.revenue / maxRevenue) * 100
                return (
                  <div key={item.month} className="flex flex-1 flex-col items-center">
                    <div className="relative mb-2 w-full rounded-t-lg bg-brand/20" style={{ height: `${height}%` }} />
                    <p className="text-xs text-muted-foreground">{item.month}</p>
                    <p className="text-xs font-medium text-foreground">${Math.round(item.revenue / 1000)}k</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 shadow-token-xs">
            <h3 className="text-sm font-semibold text-muted-foreground">Total Revenue</h3>
            <p className="mt-2 text-2xl font-bold text-foreground">{revenueKpi?.value ?? money(totals.revenue)}</p>
            {revenueKpi && (
              <p className={`mt-1 text-xs ${revenueKpi.trend === 'up' ? 'text-success' : 'text-destructive'}`}>
                {revenueKpi.change > 0 ? '+' : ''}{revenueKpi.change}% from last period
              </p>
            )}
          </div>
          <div className="rounded-xl border border-border bg-card p-6 shadow-token-xs">
            <h3 className="text-sm font-semibold text-muted-foreground">Pending Invoices</h3>
            <p className="mt-2 text-2xl font-bold text-foreground">{pending}</p>
            <p className="mt-1 text-xs text-destructive">{overdue > 0 ? `${overdue} overdue` : 'None overdue'}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 shadow-token-xs">
            <h3 className="text-sm font-semibold text-muted-foreground">Total Clients</h3>
            <p className="mt-2 text-2xl font-bold text-foreground">{totals.clients}</p>
            <p className="mt-1 text-xs text-muted-foreground">{totals.products} products</p>
          </div>
        </div>
      </div>

      {/* Recent Invoices and Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Invoices */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-token-xs">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Recent Invoices</h2>
            <Link href="/dashboard/invoices" className="text-sm text-brand hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {recentInvoices.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No invoices yet.</p>
            ) : (
              recentInvoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
                      <FileText className="size-5" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{invoice.number}</p>
                      <p className="text-xs text-muted-foreground">{recipientName(invoice.recipient)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{money(invoice.total, invoice.currency)}</p>
                    <span className={`text-xs font-medium ${statusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-token-xs">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
          </div>
          <div className="space-y-4">
            {recentActivity.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No activity yet.</p>
            ) : (
              recentActivity.map((log) => (
                <div key={log.id} className="border-l-2 border-brand pl-4 py-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-foreground">{log.action}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{log.details}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
