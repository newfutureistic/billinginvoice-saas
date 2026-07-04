import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  passwordSchema,
  signUpSchema,
  signInSchema,
  resetPasswordSchema,
  changePasswordSchema,
  inviteMemberSchema,
  verifyEmailSchema,
} from '@/lib/validation/auth.schema'

test('passwordSchema enforces length + character classes', () => {
  assert.equal(passwordSchema.safeParse('ValidPass1').success, true)
  assert.equal(passwordSchema.safeParse('short1A').success, false) // too short
  assert.equal(passwordSchema.safeParse('nouppercase1').success, false)
  assert.equal(passwordSchema.safeParse('NOLOWERCASE1').success, false)
  assert.equal(passwordSchema.safeParse('NoDigitsHere').success, false)
  assert.equal(passwordSchema.safeParse('x'.repeat(73) + 'A1a').success, false) // > 72 bytes
})

test('signUpSchema requires name, email, strong password', () => {
  assert.equal(
    signUpSchema.safeParse({ name: 'Jane', email: 'jane@acme.com', password: 'ValidPass1' }).success,
    true,
  )
  assert.equal(signUpSchema.safeParse({ name: '', email: 'x@y.com', password: 'ValidPass1' }).success, false)
  assert.equal(signUpSchema.safeParse({ name: 'Jane', email: 'bad', password: 'ValidPass1' }).success, false)
})

test('signInSchema defaults rememberMe to false', () => {
  const parsed = signInSchema.parse({ email: 'a@b.com', password: 'anything' })
  assert.equal(parsed.rememberMe, false)
  assert.equal(signInSchema.safeParse({ email: 'a@b.com' }).success, false)
})

test('resetPassword requires a sufficiently long token', () => {
  assert.equal(resetPasswordSchema.safeParse({ token: 'short', password: 'ValidPass1' }).success, false)
  assert.equal(
    resetPasswordSchema.safeParse({ token: 'x'.repeat(32), password: 'ValidPass1' }).success,
    true,
  )
})

test('changePassword rejects reusing the current password', () => {
  assert.equal(
    changePasswordSchema.safeParse({ currentPassword: 'ValidPass1', newPassword: 'ValidPass1' }).success,
    false,
  )
  assert.equal(
    changePasswordSchema.safeParse({ currentPassword: 'OldPass123', newPassword: 'NewPass123' }).success,
    true,
  )
})

test('invite role excludes OWNER (transfer-only)', () => {
  assert.equal(inviteMemberSchema.safeParse({ email: 'a@b.com', role: 'MANAGER' }).success, true)
  assert.equal(inviteMemberSchema.safeParse({ email: 'a@b.com', role: 'OWNER' }).success, false)
  // Defaults to MEMBER when omitted.
  assert.equal(inviteMemberSchema.parse({ email: 'a@b.com' }).role, 'MEMBER')
})

test('verifyEmail requires a 6-digit code', () => {
  assert.equal(verifyEmailSchema.safeParse({ email: 'a@b.com', code: '123456' }).success, true)
  assert.equal(verifyEmailSchema.safeParse({ email: 'a@b.com', code: '12ab56' }).success, false)
})
