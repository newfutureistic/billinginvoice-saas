/** DTO layer barrel: Output DTOs + mappers. Input DTOs come from `lib/validation`. */
export { iso, isoOrNull } from '@/lib/dto/common.dto'
export { toClientDTO, type ClientOutputDTO } from '@/lib/dto/client.dto'
export { toProductDTO, type ProductOutputDTO } from '@/lib/dto/product.dto'
export {
  toToolDTO,
  toToolCategoryDTO,
  type ToolOutputDTO,
  type ToolCategoryOutputDTO,
} from '@/lib/dto/tool.dto'
export {
  toWorkspaceDTO,
  toOrganizationDTO,
  type WorkspaceOutputDTO,
  type OrganizationOutputDTO,
} from '@/lib/dto/workspace.dto'
export { toPlanDTO, type PlanOutputDTO } from '@/lib/dto/plan.dto'
export { toNotificationDTO, type NotificationOutputDTO } from '@/lib/dto/notification.dto'
export { toFileDTO, type FileOutputDTO } from '@/lib/dto/file.dto'
export { toUserDTO, type UserOutputDTO } from '@/lib/dto/user.dto'
export {
  toDocumentDTO,
  toDocumentItemDTO,
  toDocumentDetailDTO,
  type DocumentOutputDTO,
  type DocumentItemDTO,
  type DocumentDetailDTO,
} from '@/lib/dto/document.dto'
export {
  toTemplateDTO,
  toTemplatePreviewDTO,
  type TemplateOutputDTO,
  type TemplatePreviewDTO,
} from '@/lib/dto/template.dto'
export {
  toActivityDTO,
  toAuditDTO,
  type ActivityOutputDTO,
  type AuditOutputDTO,
} from '@/lib/dto/activity.dto'
export {
  percentChange,
  type KpiDTO,
  type RevenuePointDTO,
  type StatusSliceDTO,
  type DashboardSummaryDTO,
} from '@/lib/dto/dashboard.dto'
export {
  type SearchEntity,
  type SearchResultDTO,
  type SearchResponseDTO,
} from '@/lib/dto/search.dto'
export { toPaymentDTO, type PaymentOutputDTO } from '@/lib/dto/payment.dto'
export {
  toSessionDTO,
  toMemberDTO,
  toMembershipSummaryDTO,
  toCurrentUserDTO,
  type SessionOutputDTO,
  type MemberDTO,
  type MembershipSummaryDTO,
  type CurrentUserDTO,
} from '@/lib/dto/auth.dto'
