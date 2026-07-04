import { Prisma } from '@prisma/client'
import { BaseService } from '@/server/services/base.service'
import { AuditLogRepository } from '@/server/repositories/audit-log.repository'
import type { RequestContext } from '@/server/http/context'

/** Keys that must never be persisted to the audit trail, at any nesting depth. */
const REDACTED_KEYS = new Set([
  'password',
  'passwordhash',
  'newpassword',
  'currentpassword',
  'token',
  'tokenhash',
  'sessiontoken',
  'secret',
  'codehash',
  'code',
  'backupcode',
  'refresh_token',
  'access_token',
  'id_token',
])

type Snapshot = Record<string, unknown> | null | undefined

export interface AuditEntry {
  action: string
  targetType: string
  targetId: string
  /** Overrides `ctx.workspaceId` when the event targets a specific workspace. */
  workspaceId?: string
  actorId?: string | null
  before?: Snapshot
  after?: Snapshot
}

/**
 * Audit service (RBAC.md §8). Writes tamper-evident records of sensitive actions with
 * actor, target, before/after snapshots and request metadata. Two hard guarantees:
 *  1. **Never throws** — an audit failure must not break the business action it records.
 *  2. **Redacts secrets** — passwords, tokens and OAuth material are stripped from
 *     snapshots before they are persisted.
 *
 * `AuditLog.workspaceId` is required by the schema, so pre-workspace events (e.g. a
 * failed login for an unknown email) are logged structurally instead of persisted.
 */
export class AuditService extends BaseService {
  private readonly repo: AuditLogRepository

  constructor(ctx: RequestContext, repo: AuditLogRepository = new AuditLogRepository()) {
    super(ctx)
    this.repo = repo
  }

  async record(entry: AuditEntry): Promise<void> {
    const workspaceId = entry.workspaceId ?? this.ctx.workspaceId
    const actorId = entry.actorId ?? this.ctx.user?.id ?? null

    if (!workspaceId) {
      // No tenant to attach the row to — keep an observable trail without persisting.
      this.logger.info('audit.event', { action: entry.action, targetId: entry.targetId, actorId })
      return
    }

    try {
      await this.repo.create({
        workspaceId,
        actorId,
        action: entry.action,
        targetType: entry.targetType,
        targetId: entry.targetId,
        before: redact(entry.before),
        after: redact(entry.after),
        ip: this.ctx.ip ?? null,
        userAgent: this.ctx.userAgent ?? null,
      })
    } catch (err) {
      this.logger.error('audit.write_failed', {
        action: entry.action,
        error: err instanceof Error ? err.message : String(err),
      })
    }
  }
}

/** Deep-redact a snapshot, replacing sensitive values with `"[redacted]"`. */
function redact(value: Snapshot): Prisma.InputJsonValue | null {
  if (value === null || value === undefined) return null
  return redactValue(value) as Prisma.InputJsonValue
}

function redactValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redactValue)
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [key, v] of Object.entries(value)) {
      out[key] = REDACTED_KEYS.has(key.toLowerCase()) ? '[redacted]' : redactValue(v)
    }
    return out
  }
  return value
}

/** Redaction is exported for unit testing. */
export { redactValue as __redactForTest }
