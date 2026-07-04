/** Repository layer barrel — data access only (no services / API here). */
export * from '@/server/repositories/types'
export {
  type ListOptions,
  resolveOrderBy,
  DEFAULT_SORT,
  type SortInput,
  type SortDirection,
} from '@/server/repositories/query'
export {
  type CursorInput,
  type CursorPage,
  DEFAULT_CURSOR_LIMIT,
  MAX_CURSOR_LIMIT,
  resolveCursorLimit,
} from '@/server/repositories/cursor'
export { BaseRepository } from '@/server/repositories/base.repository'
export { TenantRepository } from '@/server/repositories/tenant.repository'
export { WorkspaceRepository, type WorkspaceWithSettings } from '@/server/repositories/workspace.repository'
export {
  DocumentRepository,
  type DocumentFilter,
  type DocumentCreateData,
  type DocumentRepositoryContract,
} from '@/server/repositories/document.repository'
export {
  ClientRepository,
  CLIENT_SORTABLE,
  type ClientFilter,
  type ClientCreateData,
  type ClientRepositoryContract,
} from '@/server/repositories/client.repository'
export {
  ProductRepository,
  PRODUCT_SORTABLE,
  type ProductFilter,
  type ProductCreateData,
  type ProductRepositoryContract,
} from '@/server/repositories/product.repository'
export { ToolRepository, type ToolWithCategory } from '@/server/repositories/tool.repository'

// --- Business CRUD engine (Mission 5) --------------------------------------
export {
  DocumentSequenceRepository,
  type AllocatedNumber,
} from '@/server/repositories/document-sequence.repository'
export {
  TemplateRepository,
  type TemplateCreateData,
  type TemplateUpdateData,
} from '@/server/repositories/template.repository'
export {
  DashboardRepository,
  type EntityCounts,
  type RevenueTotals,
  type StatusBucket,
  type MonthlyPoint,
} from '@/server/repositories/dashboard.repository'
export { ActivityRepository, type ActivityCreateData } from '@/server/repositories/activity.repository'
export {
  NotificationRepository,
  type NotificationFilter,
  type NotificationCreateData,
} from '@/server/repositories/notification.repository'
export {
  type DocumentItemCreateData,
  type DocumentWithItems,
} from '@/server/repositories/document.repository'

// --- Identity & access (Mission 4) -----------------------------------------
export { UserRepository, type UserCreateData } from '@/server/repositories/user.repository'
export { SessionRepository, type SessionCreateData } from '@/server/repositories/session.repository'
export { VerificationTokenRepository } from '@/server/repositories/verification-token.repository'
export {
  MembershipRepository,
  type MembershipCreateData,
  type MembershipWithUser,
  type MembershipWithWorkspace,
} from '@/server/repositories/membership.repository'
export {
  InvitationRepository,
  type InvitationCreateData,
} from '@/server/repositories/invitation.repository'
export {
  AuditLogRepository,
  type AuditLogCreateData,
} from '@/server/repositories/audit-log.repository'
