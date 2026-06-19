import type { Experience, Portfolio } from '@/payload-types'

import { experienceHref, portfolioHref } from './routes'

/**
 * One entry of a polymorphic portfolio|experience relationship — the shared
 * shape of Portfolio.relatedContent and Visitor.expectations[].relevantContent.
 */
export type ContentRef =
  | { relationTo: 'portfolio'; value: number | Portfolio }
  | { relationTo: 'experience'; value: number | Experience }

/**
 * A resolved reference: the populated doc + its public href. Discriminated on
 * `relationTo` so callers can narrow `doc` to the matching collection and shape
 * their own labels off it.
 */
export type ResolvedRef =
  | { relationTo: 'portfolio'; doc: Portfolio; href: string }
  | { relationTo: 'experience'; doc: Experience; href: string }

/**
 * Resolve a polymorphic portfolio|experience relationship to its populated docs
 * + hrefs, preserving order. Needs a depth>=1 query (values populated to docs);
 * unpopulated ids and slug-less docs are skipped. Callers map the discriminated
 * `doc` to whatever card label they render — this owns only the narrowing, the
 * slug guard, and the route shape.
 */
export function resolveContentRefs(refs?: ContentRef[] | null): ResolvedRef[] {
  return (refs ?? [])
    .map((ref): ResolvedRef | null => {
      // Check the discriminant first so `value` narrows to the matching doc.
      if (ref.relationTo === 'portfolio') {
        const value = ref.value
        if (typeof value !== 'object' || !value || !value.slug) return null
        return { relationTo: 'portfolio', doc: value, href: portfolioHref(value.slug) }
      }
      const value = ref.value
      if (typeof value !== 'object' || !value || !value.slug) return null
      return { relationTo: 'experience', doc: value, href: experienceHref(value.slug) }
    })
    .filter((ref): ref is ResolvedRef => Boolean(ref))
}
