import { type ActivityEvent } from '@prisma/client'
import { BaseRepository } from '@/server/repositories/base.repository'
import {
  buildPageMeta,
  resolvePagination,
  type Paginated,
  type PaginationInput,
} from '@/server/db/utils'

export interface ActivityCreateData {
  workspaceId: string
  actorLabel: string
  verb: string
  summary: string
  relatedType?: string | null
  relatedId?: string | null
}

/**
 * Activity-timeline repository (business-facing). Distinct from the security `AuditLog`:
 * `ActivityEvent` is the human-readable "what happened" feed shown in the dashboard,
 * whereas `AuditLog` is the tamper-evident compliance trail.
 */
export class ActivityRepository extends BaseRepository {
  create(data: ActivityCreateData): Promise<ActivityEvent> {
    return this.run(() =>
      this.db.activityEvent.create({
        data: {
          workspaceId: data.workspaceId,
          actorLabel: data.actorLabel,
          verb: data.verb,
          summary: data.summary,
          relatedType: data.relatedType ?? null,
          relatedId: data.relatedId ?? null,
        },
      }),
    )
  }

  listByWorkspace(
    workspaceId: string,
    pagination?: PaginationInput,
  ): Promise<Paginated<ActivityEvent>> {
    const { page, pageSize, skip, take } = resolvePagination(pagination)
    return this.run(async () => {
      const [total, data] = await Promise.all([
        this.db.activityEvent.count({ where: { workspaceId } }),
        this.db.activityEvent.findMany({
          where: { workspaceId },
          orderBy: { createdAt: 'desc' },
          skip,
          take,
        }),
      ])
      return { data, meta: buildPageMeta(total, page, pageSize) }
    })
  }

  recent(workspaceId: string, limit = 10): Promise<ActivityEvent[]> {
    return this.run(() =>
      this.db.activityEvent.findMany({
        where: { workspaceId },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
    )
  }
}
