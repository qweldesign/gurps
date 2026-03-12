import { useState } from 'react'

export function useSessionStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = sessionStorage.getItem(key)
    if (!stored) return initialValue

    try {
      return JSON.parse(stored)
    } catch {
      return initialValue
    }
  })

  const setSessionValue = (newValue: T) => {
    setValue(newValue)
    sessionStorage.setItem(key, JSON.stringify(newValue))
  }

  return [value, setSessionValue] as const
}
