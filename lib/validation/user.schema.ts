import { z } from 'zod'
import { emailSchema } from '@/lib/validation/common.schema'

// NB: authentication is out of scope for Mission 3 — these validate user *profile*
// shape only (no passwords, sessions, or credentials).
export const userCreateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  email: emailSchema,
  timezone: z.string().max(64).default('UTC'),
  image: z.string().url().optional(),
})

export const userUpdateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  timezone: z.string().max(64).optional(),
  image: z.string().url().optional(),
})

export type UserCreateInput = z.infer<typeof userCreateSchema>
export type UserUpdateInput = z.infer<typeof userUpdateSchema>
