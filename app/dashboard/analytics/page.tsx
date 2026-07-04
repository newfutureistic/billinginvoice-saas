'use client'

import { mockRevenueData, mockKPIs } from '@/lib/dashboard-data'
import { KPICard } from '@/components/dashboard/dashboard-cards'
import { Calendar } from 'lucide-react'

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 p-6 sm:p-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <p className="mt-2 text-muted-foreground">Track your business metrics and performance.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {mockKPIs.map((kpi) => (
          <KPICard key={kpi.id} kpi={kpi} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Analytics */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-token-xs">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Revenue Analytics</h2>
            <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm hover:bg-muted">
              <Calendar className="size-4" />
              Last 6 Months
            </button>
          </div>
          <div className="space-y-4">
            {mockRevenueData.map((item) => (
              <div key={item.month} className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{item.month}</span>
                <div className="flex flex-1 items-center gap-3 px-4">
                  <div className="h-2 flex-1 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-brand"
                      style={{ width: `${(item.revenue / 13500) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-semibold text-foreground">${item.revenue}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Invoice Analytics */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-token-xs">
          <h2 className="mb-6 text-lg font-semibold text-foreground">Invoice Analytics</h2>
          <div className="space-y-6">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Paid</span>
                <span className="text-lg font-semibold text-foreground">68%</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div className="h-full w-2/3 rounded-full bg-success" />
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Sent</span>
                <span className="text-lg font-semibold text-foreground">24%</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div className="h-full w-1/4 rounded-full bg-brand" />
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Draft</span>
                <span className="text-lg font-semibold text-foreground">8%</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div className="h-full w-1/12 rounded-full bg-muted-foreground" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
