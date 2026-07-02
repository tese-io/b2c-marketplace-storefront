'use client'

import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'tese-listing-filters-collapsed'

export function useListingSidebarCollapsed () {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    try {
      setIsCollapsed(window.sessionStorage.getItem(STORAGE_KEY) === 'true')
    } catch {
      setIsCollapsed(false)
    }
    setIsReady(true)
  }, [])

  const setCollapsed = useCallback((next: boolean) => {
    setIsCollapsed(next)
    try {
      window.sessionStorage.setItem(STORAGE_KEY, String(next))
    } catch {
      // ignore storage failures
    }
  }, [])

  const toggleCollapsed = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev
      try {
        window.sessionStorage.setItem(STORAGE_KEY, String(next))
      } catch {
        // ignore storage failures
      }
      return next
    })
  }, [])

  return { isCollapsed, isReady, setCollapsed, toggleCollapsed }
}
