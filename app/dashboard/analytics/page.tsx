'use client'

import { useState } from 'react'
import { KPICard } from '@/components/dashboard/dashboard-cards'
import { useDashboard } from '@/lib/api/hooks/use-dashboard'
import { DollarSign, FileText, Users, Package } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const KPI_ICONS: Record<string, LucideIcon> = {
  revenue: DollarSign,
  invoices: FileText,
  clients: Users,
  products: Package,
}

const STATUS_COLOR: Record<string, string> = {
  paid: 'bg-success',
  sent: 'bg-brand',
  partially_paid: 'bg-warning',
  draft: 'bg-muted-foreground',
  overdue: 'bg-destructive',
  cancelled: 'bg-muted-foreground',
}

export default function AnalyticsPage() {
  const [months, setMonths] = useState(6)
  const { data, isPending, isError, refetch } = useDashboard(months)

  if (isPending) {
    return (
      <div className="space-y-6 p-6 sm:p-8">
        <Header months={months} setMonths={setMonths} />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl border border-border bg-card" />
          ))}
        </div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="space-y-6 p-6 sm:p-8">
        <Header months={months} setMonths={setMonths} />
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
          <p className="text-destructive">Could not load analytics.</p>
          <button
            onClick={() => refetch()}
            className="mt-4 rounded-lg bg-brand px-4 py-2 font-medium text-brand-foreground hover:bg-brand/90"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  const maxRevenue = Math.max(1, ...data.revenue.map((d) => d.revenue))
  const totalCount = Math.max(1, data.statusBreakdown.reduce((s, x) => s + x.count, 0))

  return (
    <div className="space-y-6 p-6 sm:p-8">
      <Header months={months} setMonths={setMonths} />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {data.kpis.map((kpi) => (
          <KPICard key={kpi.id} kpi={{ ...kpi, icon: KPI_ICONS[kpi.id] ?? DollarSign }} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Analytics */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-token-xs">
          <h2 className="mb-6 text-lg font-semibold text-foreground">Revenue Analytics</h2>
          {data.revenue.length === 0 ? (
            <p className="text-sm text-muted-foreground">No revenue data yet.</p>
          ) : (
            <div className="space-y-4">
              {data.revenue.map((item) => (
                <div key={item.month} className="flex items-center justify-between gap-3">
                  <span className="w-10 shrink-0 text-sm font-medium text-foreground">{item.month}</span>
                  <div className="h-2 flex-1 rounded-full bg-muted">
                    <div className="h-full rounded-full bg-brand" style={{ width: `${(item.revenue / maxRevenue) * 100}%` }} />
                  </div>
                  <span className="w-20 shrink-0 text-right text-sm font-semibold text-foreground">
                    ${Math.round(item.revenue).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Invoice Analytics (real status breakdown) */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-token-xs">
          <h2 className="mb-6 text-lg font-semibold text-foreground">Invoice Analytics</h2>
          {data.statusBreakdown.length === 0 ? (
            <p className="text-sm text-muted-foreground">No invoices yet.</p>
          ) : (
            <div className="space-y-6">
              {data.statusBreakdown.map((slice) => {
                const pct = Math.round((slice.count / totalCount) * 100)
                const label = slice.status.charAt(0) + slice.status.slice(1).toLowerCase().replace(/_/g, ' ')
                return (
                  <div key={slice.status}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">{label}</span>
                      <span className="text-lg font-semibold text-foreground">{pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${STATUS_COLOR[slice.status.toLowerCase()] ?? 'bg-brand'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Header({ months, setMonths }: { months: number; setMonths: (m: number) => void }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <p className="mt-2 text-muted-foreground">Track your business metrics and performance.</p>
      </div>
      <select
        value={months}
        onChange={(e) => setMonths(Number(e.target.value))}
        className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
        aria-label="Time range"
      >
        <option value={3}>Last 3 months</option>
        <option value={6}>Last 6 months</option>
        <option value={12}>Last 12 months</option>
      </select>
    </div>
  )
}
