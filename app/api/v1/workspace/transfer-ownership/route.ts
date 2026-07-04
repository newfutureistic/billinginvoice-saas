import { defineRoute } from '@/server/http/handler'
import { MembershipService } from '@/server/services/membership.service'
import {
  transferOwnershipSchema,
  type TransferOwnershipInput,
} from '@/lib/validation/auth.schema'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/v1/workspace/transfer-ownership — atomically hand the OWNER role to another
 * active member and demote the caller to ADMIN (RBAC.md §6). Only the current OWNER may
 * call this; the guard lives in the service so internal callers are equally protected.
 */
export const POST = defineRoute<{ ok: true }, TransferOwnershipInput>({
  requireMembership: true,
  schema: { body: transferOwnershipSchema },
  csrf: true,
  handler: async ({ body, ctx }) => {
    await new MembershipService(ctx).transferOwnership(body)
    return { ok: true }
  },
})
