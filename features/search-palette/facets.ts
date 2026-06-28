import type { SearchDocument, SearchDocumentType } from '@/lib/search/types'

/**
 * Filter chips facet the result list by document type (Open: "by doc type,
 * dynamic"). "All" plus one chip per type actually present in the corpus — so
 * an empty collection contributes no dead chip. For visitors a leading
 * "Company: {role}" facet is prepended by the palette (handled there, since it
 * scopes to the visitor's relevant content rather than a doc type).
 */
export type Facet = {
  /** 'all' | 'company' | a SearchDocumentType. */
  key: string
  label: string
}

export const ALL_FACET = 'all'
export const COMPANY_FACET = 'company'

/** Display order + plural labels for the type facets (eyebrow is singular). */
const TYPE_FACETS: { type: SearchDocumentType; label: string }[] = [
  { type: 'experience', label: 'Experience' },
  { type: 'portfolio', label: 'Features' },
  { type: 'section', label: 'Sections' },
]

/** Build the chip list: All first, then each type present in the corpus. */
export function buildFacets(documents: readonly SearchDocument[]): Facet[] {
  const present = new Set(documents.map((doc) => doc.type))
  return [
    { key: ALL_FACET, label: 'All' },
    ...TYPE_FACETS.filter((facet) => present.has(facet.type)).map((facet) => ({
      key: facet.type,
      label: facet.label,
    })),
  ]
}

/** Narrow results to the active facet. 'all' is a pass-through; 'company' is handled upstream. */
export function applyFacet(results: readonly SearchDocument[], facetKey: string): SearchDocument[] {
  if (facetKey === ALL_FACET || facetKey === COMPANY_FACET) return [...results]
  return results.filter((doc) => doc.type === facetKey)
}
