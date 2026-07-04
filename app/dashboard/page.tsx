'use client'

import { KPICard, StatCard } from '@/components/dashboard/dashboard-cards'
import { mockKPIs, mockRevenueData, mockInvoices, mockActivityLogs } from '@/lib/dashboard-data'
import { ArrowUpRight, Calendar, FileText } from 'lucide-react'
import Link from 'next/link'

export default function DashboardOverview() {
  const recentInvoices = mockInvoices.slice(0, 5)
  const recentActivity = mockActivityLogs.slice(0, 4)

  return (
    <div className="space-y-8 p-6 sm:p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">Welcome back, Sarah. Here's what's happening with your business.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {mockKPIs.map((kpi) => (
          <KPICard key={kpi.id} kpi={kpi} />
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
          <div className="flex h-64 items-end justify-between gap-2">
            {mockRevenueData.map((item) => {
              const maxRevenue = Math.max(...mockRevenueData.map((d) => d.revenue))
              const height = (item.revenue / maxRevenue) * 100
              return (
                <div key={item.month} className="flex flex-1 flex-col items-center">
                  <div className="relative mb-2 w-full rounded-t-lg bg-brand/20" style={{ height: `${height}%` }} />
                  <p className="text-xs text-muted-foreground">{item.month}</p>
                  <p className="text-xs font-medium text-foreground">${item.revenue / 1000}k</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 shadow-token-xs">
            <h3 className="text-sm font-semibold text-muted-foreground">This Month</h3>
            <p className="mt-2 text-2xl font-bold text-foreground">$42,500</p>
            <p className="mt-1 text-xs text-success">+12.5% from last month</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 shadow-token-xs">
            <h3 className="text-sm font-semibold text-muted-foreground">Pending Invoices</h3>
            <p className="mt-2 text-2xl font-bold text-foreground">3</p>
            <p className="mt-1 text-xs text-destructive">One overdue</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 shadow-token-xs">
            <h3 className="text-sm font-semibold text-muted-foreground">Total Clients</h3>
            <p className="mt-2 text-2xl font-bold text-foreground">18</p>
            <p className="mt-1 text-xs text-muted-foreground">5 this month</p>
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
            {recentInvoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
                    <FileText className="size-5" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{invoice.number}</p>
                    <p className="text-xs text-muted-foreground">{invoice.client}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">${invoice.amount}</p>
                  <span className={`text-xs font-medium ${
                    invoice.status === 'paid' ? 'text-success' :
                    invoice.status === 'sent' ? 'text-brand' :
                    invoice.status === 'overdue' ? 'text-destructive' :
                    'text-muted-foreground'
                  }`}>
                    {invoice.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-token-xs">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
          </div>
          <div className="space-y-4">
            {recentActivity.map((log) => (
              <div key={log.id} className="border-l-2 border-brand pl-4 py-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-foreground">{log.action}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{log.details}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{log.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
