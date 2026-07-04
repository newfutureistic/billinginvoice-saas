import type { ZodType } from 'zod'
import { parseWith } from '@/server/http/middleware/validation'
import { fieldErrorsFromZod } from '@/server/errors/error-handler'
import type { FieldErrors } from '@/server/errors/app-error'

/**
 * Validation service — a thin, injectable wrapper over Zod so services can validate
 * without importing schema-plumbing directly. `validate` throws a typed `ValidationError`
 * (422); `safeValidate` returns a discriminated result for non-throwing flows.
 */
export type SafeValidationResult<T> =
  | { success: true; data: T }
  | { success: false; fields: FieldErrors }

export class ValidationService {
  validate<T>(schema: ZodType<T>, data: unknown): T {
    return parseWith(schema, data)
  }

  safeValidate<T>(schema: ZodType<T>, data: unknown): SafeValidationResult<T> {
    const result = schema.safeParse(data)
    if (result.success) return { success: true, data: result.data }
    return { success: false, fields: fieldErrorsFromZod(result.error) }
  }
}

export const validationService = new ValidationService()
