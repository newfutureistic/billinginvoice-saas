import { defineRoute } from '@/server/http/handler'
import { ProfileService } from '@/server/services/profile.service'
import { userUpdateSchema, type UserUpdateInput } from '@/lib/validation/user.schema'
import type { UserOutputDTO } from '@/lib/dto/user.dto'
import { UnauthenticatedError } from '@/server/errors/app-error'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** GET /api/v1/auth/profile — the signed-in user's profile. */
export const GET = defineRoute<UserOutputDTO>({
  requireAuth: true,
  handler: ({ ctx }) => {
    if (!ctx.user) throw new UnauthenticatedError()
    return new ProfileService(ctx).get(ctx.user.id)
  },
})

/** PATCH /api/v1/auth/profile — update name / timezone / avatar. */
export const PATCH = defineRoute<UserOutputDTO, UserUpdateInput>({
  requireAuth: true,
  schema: { body: userUpdateSchema },
  csrf: true,
  handler: ({ body, ctx }) => {
    if (!ctx.user) throw new UnauthenticatedError()
    return new ProfileService(ctx).update(ctx.user.id, body)
  },
})
