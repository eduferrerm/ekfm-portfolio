'use client'

import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'ekfm:recent-searches'
const MAX_RECENT = 5

/**
 * Per-device recent search queries, persisted in localStorage. Most-recent
 * first, de-duplicated (case-insensitive), capped at MAX_RECENT. SSR-safe: the
 * initial render is empty and hydrates from storage in an effect, so server and
 * client markup agree.
 */
export function useRecentSearches() {
  const [recents, setRecents] = useState<string[]>([])

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed: unknown = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          setRecents(parsed.filter((q): q is string => typeof q === 'string').slice(0, MAX_RECENT))
        }
      }
    } catch {
      // Corrupt/blocked storage — start empty, never throw.
    }
  }, [])

  const persist = useCallback((next: string[]) => {
    setRecents(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // Ignore quota/availability errors; in-memory state still updates.
    }
  }, [])

  const add = useCallback((query: string) => {
    const trimmed = query.trim()
    if (!trimmed) return
    setRecents((prev) => {
      const next = [
        trimmed,
        ...prev.filter((q) => q.toLowerCase() !== trimmed.toLowerCase()),
      ].slice(0, MAX_RECENT)
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        // Ignore.
      }
      return next
    })
  }, [])

  const clear = useCallback(() => persist([]), [persist])

  return { recents, add, clear }
}
