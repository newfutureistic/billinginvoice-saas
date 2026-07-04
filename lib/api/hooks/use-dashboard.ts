'use client'

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/api/query-keys'
import { http } from '@/lib/api/http'
import { useActiveWorkspace } from '@/lib/api/workspace-context'
import type { DashboardSummaryDTO } from '@/lib/dto/dashboard.dto'

/**
 * Dashboard — the entire overview payload (KPIs, revenue series, status breakdown, recent
 * documents, recent activity, totals) from `/api/v1/dashboard`. Replaces `mockKPIs`,
 * `mockRevenueData`, `mockInvoices`, `mockActivityLogs`.
 */
export function useDashboard(months = 6) {
  const workspaceId = useActiveWorkspace()
  return useQuery<DashboardSummaryDTO>({
    queryKey: queryKeys.dashboard(months),
    queryFn: ({ signal }) => http.get('/dashboard', { query: { months }, workspaceId, signal }),
    enabled: Boolean(workspaceId),
  })
}
