import { useEffect, useState } from 'react'

export function usePersistentState(key, initialValue) {
  const [value, setValue] = useState(() => {
    const storedValue = window.localStorage.getItem(key)

    if (storedValue) {
      try {
        return JSON.parse(storedValue)
      } catch {
        return initialValue
      }
    }

    return initialValue
  })

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue]
}
