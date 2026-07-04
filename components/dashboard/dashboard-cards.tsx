'use client'

import { TrendingDown, TrendingUp } from 'lucide-react'
import type { DashboardKPI } from '@/lib/dashboard-data'

export function KPICard({ kpi }: { kpi: DashboardKPI }) {
  const Icon = kpi.icon
  const colorMap = {
    brand: 'bg-brand/10 text-brand',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    destructive: 'bg-destructive/10 text-destructive',
  }
  const trendColor = kpi.trend === 'up' ? 'text-success' : 'text-destructive'

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-token-xs">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
          <p className="mt-2 text-3xl font-semibold text-foreground">{kpi.value}</p>
          <div className={`mt-3 flex items-center gap-1 text-sm font-medium ${trendColor}`}>
            {kpi.trend === 'up' ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
            <span>{Math.abs(kpi.change)}%</span>
            <span className="text-muted-foreground">vs last period</span>
          </div>
        </div>
        <div className={`rounded-lg p-3 ${colorMap[kpi.color]}`}>
          <Icon className="size-6" />
        </div>
      </div>
    </div>
  )
}

export function StatCard({
  label,
  value,
  description,
}: {
  label: string
  value: string | number
  description?: string
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
      {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
    </div>
  )
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    href: string
  }
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-16">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
        {Icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      {action && (
        <a
          href={action.href}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 font-medium text-brand-foreground hover:bg-brand/90"
        >
          {action.label}
        </a>
      )}
    </div>
  )
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
}: {
  columns: Array<{
    key: keyof T
    label: string
    render?: (value: unknown, row: T) => React.ReactNode
  }>
  data: T[]
}) {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-border bg-muted/50">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className="px-6 py-3 text-left text-sm font-semibold text-foreground"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center">
                  <p className="text-muted-foreground">No data</p>
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr key={idx} className="border-b border-border hover:bg-muted/30">
                  {columns.map((col) => (
                    <td key={String(col.key)} className="px-6 py-4 text-sm">
                      {col.render ? col.render(row[col.key], row) : String(row[col.key])}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const statusStyles: Record<string, string> = {
    paid: 'bg-success/10 text-success',
    sent: 'bg-brand/10 text-brand',
    draft: 'bg-muted text-muted-foreground',
    overdue: 'bg-destructive/10 text-destructive',
    active: 'bg-success/10 text-success',
    inactive: 'bg-muted text-muted-foreground',
    admin: 'bg-brand/10 text-brand',
    manager: 'bg-brand-muted text-brand',
    user: 'bg-muted text-muted-foreground',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
        statusStyles[status] || 'bg-muted text-muted-foreground'
      }`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}
