import { Prisma, type AuditLog } from '@prisma/client'
import { BaseRepository } from '@/server/repositories/base.repository'
import {
  buildPageMeta,
  resolvePagination,
  type Paginated,
  type PaginationInput,
} from '@/server/db/utils'

export interface AuditLogCreateData {
  workspaceId: string
  actorId?: string | null
  action: string
  targetType: string
  targetId: string
  before?: Prisma.InputJsonValue | null
  after?: Prisma.InputJsonValue | null
  ip?: string | null
  userAgent?: string | null
}

/**
 * Audit-log repository (RBAC.md §8). Append-only record of sensitive actions — auth
 * events, membership/role/billing changes — with actor, target, before/after snapshots
 * and request metadata for incident response.
 */
export class AuditLogRepository extends BaseRepository {
  create(data: AuditLogCreateData): Promise<AuditLog> {
    const input: Prisma.AuditLogUncheckedCreateInput = {
      workspaceId: data.workspaceId,
      actorId: data.actorId ?? null,
      action: data.action,
      targetType: data.targetType,
      targetId: data.targetId,
      before: data.before ?? Prisma.JsonNull,
      after: data.after ?? Prisma.JsonNull,
      ip: data.ip ?? null,
      userAgent: data.userAgent ?? null,
    }
    return this.run(() => this.db.auditLog.create({ data: input }))
  }

  listByWorkspace(
    workspaceId: string,
    pagination?: PaginationInput,
  ): Promise<Paginated<AuditLog>> {
    const { page, pageSize, skip, take } = resolvePagination(pagination)
    return this.run(async () => {
      const [total, data] = await Promise.all([
        this.db.auditLog.count({ where: { workspaceId } }),
        this.db.auditLog.findMany({
          where: { workspaceId },
          orderBy: { createdAt: 'desc' },
          skip,
          take,
        }),
      ])
      return { data, meta: buildPageMeta(total, page, pageSize) }
    })
  }
}
