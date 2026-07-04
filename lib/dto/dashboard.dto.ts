import type { DocumentOutputDTO } from '@/lib/dto/document.dto'
import type { ActivityOutputDTO } from '@/lib/dto/activity.dto'

/**
 * Dashboard output shapes. These mirror the frozen `lib/dashboard-data.ts` types
 * (`DashboardKPI`, revenue series) minus the UI-only `icon` field (the frozen UI maps a
 * KPI `id` to its own Lucide icon), so the API is a drop-in replacement for the mock data.
 */
export interface KpiDTO {
  id: string
  label: string
  value: string | number
  change: number
  trend: 'up' | 'down'
  color: 'brand' | 'success' | 'warning' | 'destructive'
}

export interface RevenuePointDTO {
  month: string
  revenue: number
  invoices: number
}

export interface StatusSliceDTO {
  status: string
  count: number
  total: number
}

export interface DashboardSummaryDTO {
  kpis: KpiDTO[]
  revenue: RevenuePointDTO[]
  statusBreakdown: StatusSliceDTO[]
  recentDocuments: DocumentOutputDTO[]
  recentActivity: ActivityOutputDTO[]
  totals: {
    revenue: number
    outstanding: number
    clients: number
    products: number
    invoices: number
  }
}

/** Percent change between two periods; 0 when the previous period was empty. */
export function percentChange(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100
  return Math.round(((current - previous) / previous) * 1000) / 10
}
