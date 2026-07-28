'use client'

import { useEffect } from 'react'

const RELOAD_FLAG = 'bm_chunk_reload'

/** True for the errors Next.js/webpack throw when a lazy-loaded JS chunk 404s — e.g. a
 *  deploy that swapped in new build output while a tab still references the old chunk
 *  hashes. There is no way to "fix" a 404'd file client-side; a full reload fetches a
 *  fresh HTML page with correctly matched chunk references instead of leaving the
 *  in-flight client-side navigation stuck forever. */
function isChunkLoadError(message: unknown): boolean {
  const text = String(message ?? '')
  return /ChunkLoadError|Loading chunk .* failed|Failed to fetch dynamically imported module/i.test(text)
}

function reloadOnce() {
  // Guard against a reload loop if the asset is genuinely still missing server-side —
  // one automatic retry is worth it, a second failure should surface to the user instead.
  if (sessionStorage.getItem(RELOAD_FLAG)) return
  sessionStorage.setItem(RELOAD_FLAG, '1')
  window.location.reload()
}

/** Mounted once at the app root — see the module doc above for what this recovers from. */
export function ChunkErrorReload() {
  useEffect(() => {
    // Reaching this mount means the current page loaded fine — clear any flag from a
    // past reload so a later, unrelated chunk failure can still trigger one more retry.
    sessionStorage.removeItem(RELOAD_FLAG)

    const onError = (e: ErrorEvent) => {
      if (isChunkLoadError(e.message) || isChunkLoadError(e.error?.message)) reloadOnce()
    }
    const onRejection = (e: PromiseRejectionEvent) => {
      if (isChunkLoadError(e.reason?.message ?? e.reason)) reloadOnce()
    }
    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onRejection)
    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onRejection)
    }
  }, [])

  return null
}
