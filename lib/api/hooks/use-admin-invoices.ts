'use client'

import { useQuery } from '@tanstack/react-query'
import { http } from '@/lib/api/http'
import type { AdminInvoiceDTO } from '@/lib/dto/admin-invoice.dto'

interface Paginated<T> {
  items: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

/** Site-admin "all invoices" listing — saved workspace documents + builder downloads. */
export function useAdminInvoices(params: { page?: number } = {}) {
  const qs = new URLSearchParams()
  if (params.page) qs.set('page', String(params.page))
  const suffix = qs.toString() ? `?${qs}` : ''
  return useQuery<Paginated<AdminInvoiceDTO>>({
    queryKey: ['admin', 'invoices', params],
    queryFn: ({ signal }) => http.get(`/admin/invoices${suffix}`, { signal }),
  })
}

/** Fetch a fresh signed download URL for one invoice's PDF and open it in a new tab. */
export async function openAdminInvoiceDownload(id: string, source: AdminInvoiceDTO['source']): Promise<void> {
  const { url } = await http.get<{ url: string }>(`/admin/invoices/${id}/download`, { query: { source } })
  window.open(url, '_blank', 'noopener,noreferrer')
}
