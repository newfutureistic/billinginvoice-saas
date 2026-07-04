import type { Payment } from '@prisma/client'
import { iso } from '@/lib/dto/common.dto'
import { decimalToNumber } from '@/server/utils/decimal'

export interface PaymentOutputDTO {
  id: string
  amount: number
  currency: string
  method: string
  provider: string
  status: string
  reference: string | null
  receivedAt: string
}

export function toPaymentDTO(payment: Payment): PaymentOutputDTO {
  return {
    id: payment.id,
    amount: decimalToNumber(payment.amount),
    currency: payment.currency,
    method: payment.method,
    provider: payment.provider,
    status: payment.status,
    reference: payment.providerRef,
    receivedAt: iso(payment.receivedAt),
  }
}
