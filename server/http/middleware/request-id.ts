import type { NextRequest } from 'next/server'

export const REQUEST_ID_HEADER = 'x-request-id'

/** Reuse an inbound request id (for tracing across services) or mint a new one. */
export function resolveRequestId(req: NextRequest): string {
  const inbound = req.headers.get(REQUEST_ID_HEADER)
  if (inbound && /^[\w-]{8,128}$/.test(inbound)) return inbound
  return crypto.randomUUID()
}
