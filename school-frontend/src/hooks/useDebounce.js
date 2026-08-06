import { useEffect, useState } from 'react'

/**
 * Returns `value` after it has been stable for `delay` ms.
 * Used to debounce search inputs so API calls happen only after a pause
 * (SPEC2 Phase 6).
 */
export function useDebouncedValue(value, delay = 400) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
