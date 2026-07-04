import { ZodError, type ZodType } from 'zod'
import { validationErrorFromZod } from '@/server/errors/error-handler'
import { BadRequestError } from '@/server/errors/app-error'

/**
 * Parse untrusted input against a Zod schema, throwing a typed `ValidationError` (422)
 * with per-field messages on failure. Used by the route wrapper for body/query/params.
 */
export function parseWith<T>(schema: ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data)
  if (!result.success) throw validationErrorFromZod(result.error)
  return result.data
}

/** Safely read a JSON body; a malformed body is a 400, not a 500. */
export async function readJsonBody(req: Request): Promise<unknown> {
  const text = await req.text()
  if (!text) return {}
  try {
    return JSON.parse(text)
  } catch {
    throw new BadRequestError('Request body is not valid JSON')
  }
}

/** Flatten `URLSearchParams` into a plain object for schema parsing. */
export function searchParamsToObject(params: URLSearchParams): Record<string, string | string[]> {
  const out: Record<string, string | string[]> = {}
  for (const key of new Set(params.keys())) {
    const all = params.getAll(key)
    out[key] = all.length > 1 ? all : all[0]
  }
  return out
}

export { ZodError }
