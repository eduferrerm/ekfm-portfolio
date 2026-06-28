import { resolveRelevantContent } from '@/features/visitor/visitor'
import type { Visitor } from '@/payload-types'

import type { VisitorSearchContext } from './types'

/** depth>=1 Media relationship → its url; unpopulated/absent → undefined. */
const mediaUrl = (value: unknown): string | undefined =>
  typeof value === 'object' && value && 'url' in value && typeof value.url === 'string'
    ? value.url
    : undefined

/**
 * Build the palette's visitor personalization from a depth>=2 Visitor doc: one
 * group per expectation ("Expectation N/total" + the expectation prose), each
 * carrying its per-expectation relevantContent as result rows (same shape +
 * card contract as corpus results). Drives the personalized empty state and the
 * leading "Company: {role}" facet chip. Built server-side; the rows are plain
 * serializable data passed to the client palette.
 */
export function buildVisitorSearchContext(visitor: Visitor): VisitorSearchContext {
  const expectations = visitor.expectations ?? []
  const total = expectations.length

  return {
    companyChipLabel: `${visitor.company}: ${visitor.role}`,
    expectations: expectations.map((expectation, index) => ({
      title: `Expectation ${index + 1}/${total}`,
      summary: expectation.expectation,
      items: resolveRelevantContent(expectation.relevantContent).map((item) => ({
        label: item.title,
        name: item.metadata,
        href: item.href,
        thumbnail: mediaUrl(item.thumbnail),
      })),
    })),
  }
}
