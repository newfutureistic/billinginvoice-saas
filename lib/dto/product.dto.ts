import type { Product } from '@prisma/client'
import { iso } from '@/lib/dto/common.dto'
import { decimalToNumber } from '@/server/utils/decimal'

export interface ProductOutputDTO {
  id: string
  name: string
  description: string | null
  price: number
  sku: string
  category: string | null
  quantity: number
  createdAt: string
  updatedAt: string
}

export function toProductDTO(product: Product): ProductOutputDTO {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: decimalToNumber(product.price),
    sku: product.sku,
    category: product.category,
    quantity: product.quantity,
    createdAt: iso(product.createdAt),
    updatedAt: iso(product.updatedAt),
  }
}
