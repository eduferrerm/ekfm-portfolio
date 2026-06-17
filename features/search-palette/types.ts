import type { SearchDocument } from '@/lib/search/types'

/**
 * The minimum a result row needs to render (a category eyebrow, a bold name, a
 * destination, and an optional thumbnail). `SearchDocument` is a structural
 * superset, so corpus results render through the same row as the visitor's
 * pre-seeded relevant-content items.
 */
export type ResultRow = {
  /** Stable id for keyboard nav + analytics; falls back to href when absent. */
  id?: string
  label: string
  name: string
  href: string
  thumbnail?: string
}

/** One expectation group in the visitor's personalized empty state. */
export type VisitorExpectationGroup = {
  /** "Expectation 1/5" — derived from the index + total at build time. */
  title: string
  /** The expectation prose itself. */
  summary: string
  items: ResultRow[]
}

/**
 * Visitor personalization handed to the palette (built server-side from the
 * visitor's per-expectation relevantContent). Drives the personalized empty
 * state + the leading "Company: {role}" facet chip.
 */
export type VisitorSearchContext = {
  /** "Company: Senior Product Engineer" — the chip label. */
  companyChipLabel: string
  expectations: VisitorExpectationGroup[]
}

/** A search result is just a SearchDocument; aliased for readability at call sites. */
export type SearchResult = SearchDocument
