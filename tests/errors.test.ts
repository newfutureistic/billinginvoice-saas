import { test } from 'node:test'
import assert from 'node:assert/strict'

import { toAppError } from '@/server/errors/error-handler'
import {
  AppError,
  ValidationError,
  InternalError,
  ConflictError,
  isAppError,
} from '@/server/errors/app-error'
import { appErrorFromDatabaseError } from '@/server/errors/error-handler'
import { UniqueConstraintError, NotFoundError as DbNotFound } from '@/server/db/errors'
import { errorBody } from '@/server/http/response'
import { clientCreateSchema } from '@/lib/validation/client.schema'

test('toAppError: passes AppError through unchanged', () => {
  const original = new ValidationError('bad', { name: 'required' })
  assert.equal(toAppError(original), original)
})

test('toAppError: ZodError → ValidationError 422 with fields', () => {
  const parsed = clientCreateSchema.safeParse({})
  assert.equal(parsed.success, false)
  if (parsed.success) return
  const appError = toAppError(parsed.error)
  assert.ok(appError instanceof ValidationError)
  assert.equal(appError.httpStatus, 422)
  assert.ok(appError.fields && 'name' in appError.fields)
})

test('toAppError: unknown error → InternalError 500, not exposed', () => {
  const appError = toAppError(new Error('boom'))
  assert.ok(appError instanceof InternalError)
  assert.equal(appError.httpStatus, 500)
  assert.equal(appError.expose, false)
})

test('appErrorFromDatabaseError: unique → 409 Conflict, not-found → 404', () => {
  assert.ok(appErrorFromDatabaseError(new UniqueConstraintError(['email'])) instanceof ConflictError)
  assert.equal(appErrorFromDatabaseError(new DbNotFound('Client')).httpStatus, 404)
})

test('errorBody: hides internal message + details; exposes 4xx fields', () => {
  const internal = errorBody(new InternalError('secret db detail'), { requestId: 'r1' })
  assert.equal(internal.success, false)
  assert.equal(internal.error.message, 'Internal server error')
  assert.equal(internal.error.details, undefined)

  const validation = errorBody(new ValidationError('Validation failed', { name: 'required' }), { requestId: 'r1' })
  assert.equal(validation.error.code, 'VALIDATION_ERROR')
  assert.deepEqual(validation.error.fields, { name: 'required' })
})

test('isAppError guard', () => {
  assert.equal(isAppError(new AppError('x')), true)
  assert.equal(isAppError(new Error('x')), false)
})
