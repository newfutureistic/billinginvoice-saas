import { z } from 'zod'
import { emailSchema, roleSchema } from '@/lib/validation/common.schema'

/**
 * Authentication & authorization request schemas (Mission 4).
 *
 * The single source of truth for the password policy and every auth payload shape.
 * Built on the shared primitives in `common.schema.ts` (`emailSchema`, `roleSchema`)
 * so there is no duplicated validation — these same schemas back the API route wrapper,
 * the service layer, the Auth.js Credentials `authorize`, and (later) React Hook Form.
 */

// --- Password policy (one definition, reused everywhere) --------------------
export const PASSWORD_MIN_LENGTH = 8
// bcrypt only hashes the first 72 bytes; reject longer to avoid silent truncation.
export const PASSWORD_MAX_LENGTH = 72

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
  .max(PASSWORD_MAX_LENGTH, `Password must be at most ${PASSWORD_MAX_LENGTH} characters`)
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[0-9]/, 'Password must contain a number')

/** 6-digit numeric email-verification code shown on the frozen verify-email page. */
export const verificationCodeSchema = z
  .string()
  .regex(/^\d{6}$/, 'Enter the 6-digit code')

/** Opaque token from a reset/invite link. */
export const opaqueTokenSchema = z.string().min(16, 'Invalid or missing token')

// --- Credentials flows ------------------------------------------------------
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.coerce.boolean().default(false),
})

export const signUpSchema = z.object({
  name: z.string().min(1, 'Name is required').max(120),
  email: emailSchema,
  password: passwordSchema,
  acceptTerms: z.coerce.boolean().optional(),
})

export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

export const resetPasswordSchema = z.object({
  token: opaqueTokenSchema,
  password: passwordSchema,
})

export const verifyEmailSchema = z.object({
  email: emailSchema,
  code: verificationCodeSchema,
})

export const resendVerificationSchema = z.object({
  email: emailSchema,
})

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
  })
  .refine((v) => v.currentPassword !== v.newPassword, {
    message: 'New password must be different from the current password',
    path: ['newPassword'],
  })

// --- Workspace membership ---------------------------------------------------
/** Invitable roles never include OWNER (transfer-only) — enforced in the schema. */
export const invitableRoleSchema = roleSchema.exclude(['OWNER'])

export const inviteMemberSchema = z.object({
  email: emailSchema,
  role: invitableRoleSchema.default('MEMBER'),
})

export const acceptInviteSchema = z.object({
  token: opaqueTokenSchema,
})

export const changeRoleSchema = z.object({
  role: invitableRoleSchema,
})

export const transferOwnershipSchema = z.object({
  /** The membership/user id that will become the new OWNER. */
  userId: z.string().min(1, 'Target user is required'),
})

// --- Inferred types ---------------------------------------------------------
export type SignInInput = z.infer<typeof signInSchema>
export type SignUpInput = z.infer<typeof signUpSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>
export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>
export type ChangeRoleInput = z.infer<typeof changeRoleSchema>
export type TransferOwnershipInput = z.infer<typeof transferOwnershipSchema>
