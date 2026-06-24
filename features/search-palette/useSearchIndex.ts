'use client'

import { useMemo } from 'react'

import { createFuse } from '@/lib/fuse'
import { SEARCH_FUSE_OPTIONS, type SearchDocument } from '@/lib/search/types'

/**
 * Builds the client-side Fuse index from the server-provided dataset.
 *
 * The dataset is fetched once at build/ISR time (buildSearchDataset) and passed
 * down as a prop; this hook turns it into a memoized fuzzy-search index and a
 * `search` function. No network calls — search is fully client-side (Fuse.js).
 */
export function useSearchIndex(documents: readonly SearchDocument[]) {
  const fuse = useMemo(() => createFuse(documents, SEARCH_FUSE_OPTIONS), [documents])

  const search = useMemo(
    () =>
      (query: string): SearchDocument[] => {
        const trimmed = query.trim()
        if (!trimmed) return []
        return fuse.search(trimmed).map((result) => result.item)
      },
    [fuse],
  )

  return { search }
}
