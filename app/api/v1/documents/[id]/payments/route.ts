import { z } from 'zod'
import { defineRoute } from '@/server/http/handler'
import { PaymentService, type RecordPaymentResult } from '@/server/services/payment.service'
import { recordPaymentBodySchema, type RecordPaymentBody } from '@/lib/validation/payment.schema'
import { idSchema } from '@/lib/validation/common.schema'
import type { PaymentOutputDTO } from '@/lib/dto/payment.dto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const paramsSchema = z.object({ id: idSchema })
type Params = z.infer<typeof paramsSchema>

/** GET /api/v1/documents/:id/payments — payment history for a document. */
export const GET = defineRoute<PaymentOutputDTO[], undefined, undefined, Params>({
  requireMembership: true,
  schema: { params: paramsSchema },
  handler: ({ params, ctx }) => new PaymentService(ctx).list(params.id),
})

/** POST /api/v1/documents/:id/payments — record a manual payment; updates paid amount + status. */
export const POST = defineRoute<RecordPaymentResult, RecordPaymentBody, undefined, Params>({
  requireMembership: true,
  schema: { params: paramsSchema, body: recordPaymentBodySchema },
  csrf: true,
  status: 201,
  handler: ({ params, body, ctx }) => new PaymentService(ctx).record(params.id, body),
})
