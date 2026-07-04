import type { Session } from '@prisma/client'
import { iso, isoOrNull } from '@/lib/dto/common.dto'
import { toUserDTO, type UserOutputDTO } from '@/lib/dto/user.dto'
import type {
  MembershipWithWorkspace,
  MembershipWithUser,
} from '@/server/repositories/membership.repository'
import { permissionsForRole, type Permission } from '@/server/auth/permissions'

/** A single active session, safe to list on the security screen. */
export interface SessionOutputDTO {
  id: string
  current: boolean
  rememberMe: boolean
  ip: string | null
  userAgent: string | null
  createdAt: string
  lastActiveAt: string
  expiresAt: string
}

export function toSessionDTO(session: Session, currentSid?: string): SessionOutputDTO {
  return {
    id: session.id,
    current: session.id === currentSid,
    rememberMe: session.rememberMe,
    ip: session.ip,
    userAgent: session.userAgent,
    createdAt: iso(session.createdAt),
    lastActiveAt: iso(session.lastActiveAt),
    expiresAt: iso(session.expires),
  }
}

/** A workspace member as shown on the frozen team page (user + role + status). */
export interface MemberDTO {
  id: string
  userId: string
  name: string | null
  email: string
  image: string | null
  role: string
  status: string
  joinedAt: string
}

export function toMemberDTO(m: MembershipWithUser): MemberDTO {
  return {
    id: m.id,
    userId: m.userId,
    name: m.user.name,
    email: m.user.email,
    image: m.user.image,
    role: m.role,
    status: m.status,
    joinedAt: iso(m.joinedAt),
  }
}

/** A user's membership of one workspace (backs the frozen WorkspaceSwitcher). */
export interface MembershipSummaryDTO {
  workspaceId: string
  workspaceName: string
  workspaceSlug: string
  role: string
  status: string
}

export function toMembershipSummaryDTO(m: MembershipWithWorkspace): MembershipSummaryDTO {
  return {
    workspaceId: m.workspaceId,
    workspaceName: m.workspace.name,
    workspaceSlug: m.workspace.slug,
    role: m.role,
    status: m.status,
  }
}

/** The `current-user` payload: identity + workspaces + the active role's permissions. */
export interface CurrentUserDTO {
  user: UserOutputDTO
  memberships: MembershipSummaryDTO[]
  activeWorkspaceId: string | null
  activeRole: string | null
  permissions: Permission[]
}

export function toCurrentUserDTO(
  user: Parameters<typeof toUserDTO>[0],
  memberships: MembershipWithWorkspace[],
  activeWorkspaceId: string | null,
): CurrentUserDTO {
  const active = memberships.find((m) => m.workspaceId === activeWorkspaceId) ?? null
  return {
    user: toUserDTO(user),
    memberships: memberships.map(toMembershipSummaryDTO),
    activeWorkspaceId: active?.workspaceId ?? null,
    activeRole: active?.role ?? null,
    permissions: active ? permissionsForRole(active.role) : [],
  }
}

export { isoOrNull }
