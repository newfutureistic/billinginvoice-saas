import type { ActivityEvent, AuditLog, Prisma } from '@prisma/client'
import { iso } from '@/lib/dto/common.dto'

/** Activity-timeline entry (business feed), aligned to the frozen `ActivityLog` shape. */
export interface ActivityOutputDTO {
  id: string
  action: string
  user: string
  timestamp: string
  details: string
  relatedType: string | null
  relatedId: string | null
}

export function toActivityDTO(event: ActivityEvent): ActivityOutputDTO {
  return {
    id: event.id,
    action: event.verb,
    user: event.actorLabel,
    timestamp: iso(event.createdAt),
    details: event.summary,
    relatedType: event.relatedType,
    relatedId: event.relatedId,
  }
}

/** Audit-log entry (compliance trail; before/after are already secret-redacted at write). */
export interface AuditOutputDTO {
  id: string
  action: string
  targetType: string
  targetId: string
  actorId: string | null
  before: Prisma.JsonValue
  after: Prisma.JsonValue
  ip: string | null
  userAgent: string | null
  createdAt: string
}

export function toAuditDTO(log: AuditLog): AuditOutputDTO {
  return {
    id: log.id,
    action: log.action,
    targetType: log.targetType,
    targetId: log.targetId,
    actorId: log.actorId,
    before: log.before,
    after: log.after,
    ip: log.ip,
    userAgent: log.userAgent,
    createdAt: iso(log.createdAt),
  }
}
