import { BaseService } from '@/server/services/base.service'
import { ActivityRepository } from '@/server/repositories/activity.repository'
import type { RequestContext } from '@/server/http/context'

export interface ActivityEntry {
  verb: string
  summary: string
  relatedType?: string
  relatedId?: string
  /** Overrides `ctx.workspaceId` when needed. */
  workspaceId?: string
}

/**
 * Activity-timeline service (Mission 5 §11). Records a human-readable business event for
 * every mutation, attributed to the acting user. Like the audit service it **never
 * throws** — a timeline write must not break the business action it describes. Pre-tenant
 * events (no workspace) are logged structurally instead of persisted.
 */
export class ActivityService extends BaseService {
  private readonly repo: ActivityRepository

  constructor(ctx: RequestContext, repo: ActivityRepository = new ActivityRepository()) {
    super(ctx)
    this.repo = repo
  }

  /** The best label for the acting principal (name → email → "System"). */
  private actorLabel(): string {
    return this.ctx.user?.name ?? this.ctx.user?.email ?? 'System'
  }

  async record(entry: ActivityEntry): Promise<void> {
    const workspaceId = entry.workspaceId ?? this.ctx.workspaceId
    if (!workspaceId) {
      this.logger.info('activity.event', { verb: entry.verb, summary: entry.summary })
      return
    }
    try {
      await this.repo.create({
        workspaceId,
        actorLabel: this.actorLabel(),
        verb: entry.verb,
        summary: entry.summary,
        relatedType: entry.relatedType ?? null,
        relatedId: entry.relatedId ?? null,
      })
    } catch (err) {
      this.logger.error('activity.write_failed', {
        verb: entry.verb,
        error: err instanceof Error ? err.message : String(err),
      })
    }
  }
}
