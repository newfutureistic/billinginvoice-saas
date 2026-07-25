import type { User } from '@prisma/client'
import { iso, isoOrNull } from '@/lib/dto/common.dto'

/** Public-safe user projection — never exposes `passwordHash`. */
export interface UserOutputDTO {
  id: string
  name: string | null
  email: string
  image: string | null
  timezone: string
  emailVerified: string | null
  createdAt: string
}

export function toUserDTO(user: User): UserOutputDTO {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    timezone: user.timezone,
    emailVerified: isoOrNull(user.emailVerified),
    createdAt: iso(user.createdAt),
  }
}

/** Site-admin "all users" row — the public user projection plus a platform-wide invoice count. */
export interface AdminUserDTO extends UserOutputDTO {
  invoiceCount: number
}

export function toAdminUserDTO(user: User, invoiceCount: number): AdminUserDTO {
  return { ...toUserDTO(user), invoiceCount }
}
