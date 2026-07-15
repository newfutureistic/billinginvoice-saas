/** Service layer barrel. */
export { BaseService } from '@/server/services/base.service'
export {
  TenantCrudService,
  type CrudRepository,
  type ServiceListResult,
  type ListParams,
} from '@/server/services/crud.service'
export { ActivityService, type ActivityEntry } from '@/server/services/activity.service'
export {
  ValidationService,
  validationService,
  type SafeValidationResult,
} from '@/server/services/validation.service'
export { serviceLogger } from '@/server/services/logging.service'
export { normalizeError, reportError } from '@/server/services/error.service'
export {
  NoopNotificationService,
  notificationService,
  type NotificationService,
  type NotificationDispatch,
} from '@/server/services/notification.service'
export {
  SupabaseStorageService,
  UnavailableStorageService,
  storageService,
  type StorageService,
  type SignedUpload,
} from '@/server/services/storage.service'

// --- Identity & access (Mission 4) -----------------------------------------
export { AuditService, type AuditEntry } from '@/server/services/audit.service'
export {
  SessionService,
  type CreateSessionOptions,
} from '@/server/services/session.service'
export {
  AuthService,
  type AuthServiceDeps,
  type AuthenticatedIdentity,
  type SignupResult,
  type VerifyResult,
  type DeliverMessage,
} from '@/server/services/auth.service'
export {
  MembershipService,
  type MembershipServiceDeps,
  type DeliverInvite,
} from '@/server/services/membership.service'
export {
  bootstrapPersonalWorkspace,
  personalWorkspaceSlug,
  type BootstrapResult,
} from '@/server/services/workspace-bootstrap'

// --- Business CRUD engine (Mission 5) --------------------------------------
export { ClientService } from '@/server/services/client.service'
export { ProductService } from '@/server/services/product.service'
export { TemplateService } from '@/server/services/template.service'
export { DocumentService } from '@/server/services/document.service'
export { WorkspaceService, type WorkspaceDetailDTO } from '@/server/services/workspace.service'
export { DashboardService } from '@/server/services/dashboard.service'
export { SearchService } from '@/server/services/search.service'
export { NotificationFeedService } from '@/server/services/notification-feed.service'
export { ProfileService } from '@/server/services/profile.service'

// --- Storage, PDF & Email (Mission 7) --------------------------------------
export {
  FileService,
  type CreateUploadInput,
  type UploadTicket,
  type CommitInput,
  type DownloadUrl,
} from '@/server/services/file.service'
export { PdfService, type PdfResult } from '@/server/services/pdf.service'
export {
  EmailService,
  type SendEmailInput,
  type SendResult,
} from '@/server/services/email.service'
export {
  QrService,
  qrPngBytes,
  qrSvg,
  qrDataUrl,
  type QrFormat,
  type QrOptions,
  type QrStoreResult,
} from '@/server/services/qr.service'
