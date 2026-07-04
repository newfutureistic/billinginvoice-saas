import { BaseService } from '@/server/services/base.service'
import { AuditService } from '@/server/services/audit.service'
import { UserRepository } from '@/server/repositories/user.repository'
import { validationService } from '@/server/services/validation.service'
import { userUpdateSchema } from '@/lib/validation/user.schema'
import { toUserDTO, type UserOutputDTO } from '@/lib/dto/user.dto'
import type { RequestContext } from '@/server/http/context'

/**
 * Profile service (Mission 6). Reads and updates the signed-in user's own profile
 * (name, timezone, image) — reusing the existing `userUpdateSchema`, `UserRepository`,
 * and `toUserDTO`. Credential changes (password) remain in the auth service.
 */
export class ProfileService extends BaseService {
  private readonly users: UserRepository
  private readonly audit: AuditService

  constructor(ctx: RequestContext) {
    super(ctx)
    this.users = new UserRepository()
    this.audit = new AuditService(ctx)
  }

  async get(userId: string): Promise<UserOutputDTO> {
    return toUserDTO(await this.users.requireById(userId))
  }

  async update(userId: string, raw: unknown): Promise<UserOutputDTO> {
    const input = validationService.validate(userUpdateSchema, raw)
    const user = await this.users.update(userId, {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.timezone !== undefined ? { timezone: input.timezone } : {}),
      ...(input.image !== undefined ? { image: input.image } : {}),
    })
    await this.audit.record({
      action: 'user.profile.updated',
      targetType: 'User',
      targetId: userId,
      actorId: userId,
      after: { name: user.name, timezone: user.timezone },
    })
    this.logger.info('user.profile.updated', { userId })
    return toUserDTO(user)
  }
}
