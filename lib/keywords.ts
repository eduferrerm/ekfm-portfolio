import type { Keyword } from '@/payload-types'

/**
 * A scope/craft/searchKeywords relationship value: populated to a Keyword object
 * at depth>=1, or a bare id when unpopulated.
 */
type KeywordRef = number | Keyword

/**
 * Flatten one or more keyword relationship groups (scope, craft, searchKeywords)
 * to their labels, preserving attach order — the authored display order, never
 * re-sorted. Resolves only on a depth>=1 query where the relationship is
 * populated to objects; unpopulated ids are skipped.
 */
export function keywordLabels(...groups: Array<KeywordRef[] | null | undefined>): string[] {
  return groups
    .flatMap((items) => items ?? [])
    .map((k) => (typeof k === 'object' && k ? k.label : undefined))
    .filter((label): label is string => Boolean(label))
}

/**
 * Flatten the recruiter-term synonyms (aliases) off the same keyword groups —
 * search-fed recall terms that are never rendered. Same depth>=1 requirement.
 */
export function keywordAliases(...groups: Array<KeywordRef[] | null | undefined>): string[] {
  return groups
    .flatMap((items) => items ?? [])
    .flatMap((k) => (typeof k === 'object' && k ? (k.aliases ?? []) : []))
    .filter((alias): alias is string => Boolean(alias))
}
