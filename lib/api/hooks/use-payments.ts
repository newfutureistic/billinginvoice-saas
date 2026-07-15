'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { http } from '@/lib/api/http'
import { useActiveWorkspace } from '@/lib/api/workspace-context'
import { queryKeys } from '@/lib/api/query-keys'
import type { PaymentOutputDTO } from '@/lib/dto/payment.dto'
import type { DocumentDetailDTO } from '@/lib/dto/document.dto'
import type { RecordPaymentBody } from '@/lib/validation/payment.schema'

/** Payment history for a document (newest first). */
export function useDocumentPayments(documentId: string | undefined) {
  const workspaceId = useActiveWorkspace()
  return useQuery<PaymentOutputDTO[]>({
    queryKey: ['payments', documentId],
    queryFn: ({ signal }) => http.get(`/documents/${documentId}/payments`, { workspaceId, signal }),
    enabled: Boolean(workspaceId) && Boolean(documentId),
  })
}

/** Download the payment receipt PDF (fetched as base64 from the authenticated route). */
export function useDownloadReceipt(documentId: string) {
  const workspaceId = useActiveWorkspace()
  return useMutation<void, unknown, void>({
    mutationFn: async () => {
      const r = await http.get<{ filename: string; contentBase64: string }>(
        `/documents/${documentId}/receipt`,
        { workspaceId },
      )
      const bytes = Uint8Array.from(atob(r.contentBase64), (c) => c.charCodeAt(0))
      const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = url
      a.download = r.filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 60_000)
    },
  })
}

/** Email the receipt to the document's recipient. */
export function useEmailReceipt(documentId: string) {
  const workspaceId = useActiveWorkspace()
  return useMutation<{ sent: boolean; to: string }, unknown, void>({
    mutationFn: () => http.post(`/documents/${documentId}/receipt`, {}, { workspaceId }),
  })
}

/** Shape returned by the Razorpay order endpoint (kept client-local to avoid importing server code). */
export interface RazorpayOrder {
  orderId: string
  amount: number
  currency: string
  keyId: string
  documentId: string
  number: string
}

/** Create a Razorpay order for the invoice's remaining balance. */
export function useCreateRazorpayOrder(documentId: string) {
  const workspaceId = useActiveWorkspace()
  return useMutation<RazorpayOrder, unknown, void>({
    mutationFn: () => http.post(`/documents/${documentId}/razorpay/order`, {}, { workspaceId }),
  })
}

/** Verify a Razorpay capture, record it, and refresh document/history/list/dashboard. */
export function useVerifyRazorpayPayment(documentId: string) {
  const qc = useQueryClient()
  const workspaceId = useActiveWorkspace()
  return useMutation<
    { payment: PaymentOutputDTO; document: DocumentDetailDTO },
    unknown,
    { orderId: string; paymentId: string; signature: string }
  >({
    mutationFn: (body) => http.post(`/payments/razorpay/verify`, { documentId, ...body }, { workspaceId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments', documentId] })
      qc.invalidateQueries({ queryKey: queryKeys.documents.detail(documentId) })
      qc.invalidateQueries({ queryKey: queryKeys.documents.all })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

/** Record a payment; refreshes the document, payment history, list and dashboard. */
export function useRecordPayment(documentId: string) {
  const qc = useQueryClient()
  const workspaceId = useActiveWorkspace()
  return useMutation<{ payment: PaymentOutputDTO; document: DocumentDetailDTO }, unknown, RecordPaymentBody>({
    mutationFn: (body) => http.post(`/documents/${documentId}/payments`, body, { workspaceId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments', documentId] })
      qc.invalidateQueries({ queryKey: queryKeys.documents.detail(documentId) })
      qc.invalidateQueries({ queryKey: queryKeys.documents.all })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
