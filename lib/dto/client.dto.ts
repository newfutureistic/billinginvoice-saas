import type { Client } from '@prisma/client'
import { iso } from '@/lib/dto/common.dto'

export interface ClientOutputDTO {
  id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  taxId: string | null
  status: string
  createdAt: string
  updatedAt: string
}

export function toClientDTO(client: Client): ClientOutputDTO {
  return {
    id: client.id,
    name: client.name,
    email: client.email,
    phone: client.phone,
    address: client.address,
    taxId: client.taxId,
    status: client.status,
    createdAt: iso(client.createdAt),
    updatedAt: iso(client.updatedAt),
  }
}
