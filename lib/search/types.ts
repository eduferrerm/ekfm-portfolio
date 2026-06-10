import type { IFuseOptions } from 'fuse.js'

/**
 * Flat, denormalized document the search palette indexes over. Built
 * server-side from multiple collections (portfolio, experience, keywords) so
 * the client only ever sees one uniform shape.
 */
export type SearchDocument = {
  id: string
  type: 'portfolio' | 'experience' | 'keyword'
  title: string
  description?: string
  keywords: string[]
  /** Route to navigate to when this result is selected. */
  href: string
}

/** Fuse config shared by the index build. Weighted toward titles. */
export const SEARCH_FUSE_OPTIONS: IFuseOptions<SearchDocument> = {
  includeScore: true,
  threshold: 0.4,
  ignoreLocation: true,
  keys: [
    { name: 'title', weight: 0.6 },
    { name: 'keywords', weight: 0.3 },
    { name: 'description', weight: 0.1 },
  ],
}
