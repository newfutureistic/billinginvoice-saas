'use client'

import { useEffect, useState } from 'react'

/**
 * Debounce a rapidly-changing value (e.g. a search box) so downstream queries only fire
 * after the user pauses. Used by `useSearch` and the list search inputs.
 */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(handle)
  }, [value, delayMs])

  return debounced
}
