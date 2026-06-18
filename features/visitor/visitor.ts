import type { Media, Visitor } from '@/payload-types'

/**
 * A resolved per-expectation supporting-content card. Follows the shared card
 * contract (`title` + `metadata`): in this context `title` is the content
 * category ("Experience" / "Feature") and `metadata` is the surfaced item's
 * name. Polymorphic over the same two collections as Portfolio.relatedContent.
 */
export type RelevantItem = {
  title: string
  metadata: string
  href: string
  thumbnail?: Media | number | null
}

/** View-model for one Expectations slide. */
export type ExpectationView = {
  expectation: string
  replyParagraphs: string[]
  items: RelevantItem[]
}

/**
 * Resolve the polymorphic per-expectation `relevantContent` to display cards.
 * Needs a depth>=1 query (values populated to docs); unpopulated ids are
 * skipped. Portfolio → its eyebrow (the canonical card label) + thumbnail;
 * Experience → company + logo.
 */
export function resolveRelevantContent(
  related?: Visitor['expectations'][number]['relevantContent'],
): RelevantItem[] {
  return (related ?? [])
    .map((rel): RelevantItem | null => {
      // Check the discriminant first so `rel.value` narrows to the matching doc.
      if (rel.relationTo === 'portfolio') {
        const value = rel.value
        if (typeof value !== 'object' || !value || !value.slug) return null
        return {
          title: 'Feature',
          metadata: value.eyebrow,
          href: `/portfolio/${value.slug}`,
          thumbnail: value.thumbnail,
        }
      }
      const value = rel.value
      if (typeof value !== 'object' || !value || !value.slug) return null
      return {
        title: 'Experience',
        metadata: value.company,
        href: `/experience/${value.slug}`,
        thumbnail: value.companyLogo,
      }
    })
    .filter((item): item is RelevantItem => Boolean(item))
}

/**
 * Map the authored expectations to slide view-models. The reply is one prose
 * body; split it on blank lines into paragraphs (the render flows them into two
 * balanced columns).
 */
export function expectationViews(expectations?: Visitor['expectations']): ExpectationView[] {
  return (expectations ?? []).map((e) => ({
    expectation: e.expectation,
    replyParagraphs: (e.reply ?? '')
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean),
    items: resolveRelevantContent(e.relevantContent),
  }))
}
