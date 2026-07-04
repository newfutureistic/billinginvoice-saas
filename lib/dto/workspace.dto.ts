import type { Prisma, Workspace, WorkspaceSettings } from '@prisma/client'
import { iso } from '@/lib/dto/common.dto'

export interface WorkspaceOutputDTO {
  id: string
  name: string
  slug: string
  createdAt: string
}

/** Organization = the business profile carried by `WorkspaceSettings`. */
export interface OrganizationOutputDTO {
  workspaceId: string
  legalName: string | null
  businessType: string | null
  email: string | null
  phone: string | null
  address: Prisma.JsonValue | null
  defaultCurrency: string
  taxRegion: string | null
  defaultTaxType: string | null
  taxId: string | null
  brandColor: string | null
  numberFormat: string
  onboardedAt: string | null
}

export function toWorkspaceDTO(workspace: Workspace): WorkspaceOutputDTO {
  return {
    id: workspace.id,
    name: workspace.name,
    slug: workspace.slug,
    createdAt: iso(workspace.createdAt),
  }
}

export function toOrganizationDTO(settings: WorkspaceSettings): OrganizationOutputDTO {
  return {
    workspaceId: settings.workspaceId,
    legalName: settings.legalName,
    businessType: settings.businessType,
    email: settings.email,
    phone: settings.phone,
    address: settings.address ?? null,
    defaultCurrency: settings.defaultCurrency,
    taxRegion: settings.taxRegion,
    defaultTaxType: settings.defaultTaxType,
    taxId: settings.taxId,
    brandColor: settings.brandColor,
    numberFormat: settings.numberFormat,
    onboardedAt: settings.onboardedAt ? iso(settings.onboardedAt) : null,
  }
}
