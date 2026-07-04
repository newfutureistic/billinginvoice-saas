/**
 * Stable, machine-readable error codes. Clients branch on these (never on the human
 * message). Adding a code is backward-compatible; never repurpose an existing one.
 */
export const ErrorCode = {
  // Request / validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  BAD_REQUEST: 'BAD_REQUEST',
  UNSUPPORTED_MEDIA_TYPE: 'UNSUPPORTED_MEDIA_TYPE',

  // Auth (surfaced here for a consistent contract; enforcement arrives in the auth mission)
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  FORBIDDEN: 'FORBIDDEN',

  // Resource
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  GONE: 'GONE',

  // Tenancy
  TENANT_REQUIRED: 'TENANT_REQUIRED',
  WORKSPACE_NOT_FOUND: 'WORKSPACE_NOT_FOUND',

  // Business / limits
  BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION',
  PLAN_LIMIT_REACHED: 'PLAN_LIMIT_REACHED',
  RATE_LIMITED: 'RATE_LIMITED',

  // Server
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  NOT_IMPLEMENTED: 'NOT_IMPLEMENTED',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode]
