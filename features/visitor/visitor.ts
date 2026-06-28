import type { Media, Visitor } from '@/payload-types'
import { resolveContentRefs } from '@/lib/content'

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
 * The narrowing, slug guard, and route shape live in `resolveContentRefs`; here
 * we only shape the card: Portfolio → "Feature" + eyebrow + thumbnail;
 * Experience → "Experience" + company + logo.
 */
export function resolveRelevantContent(
  related?: Visitor['expectations'][number]['relevantContent'],
  scope = '',
): RelevantItem[] {
  return resolveContentRefs(related, scope).map((ref) =>
    ref.relationTo === 'portfolio'
      ? {
          title: 'Feature',
          metadata: ref.doc.eyebrow,
          href: ref.href,
          thumbnail: ref.doc.thumbnail,
        }
      : {
          title: 'Experience',
          metadata: ref.doc.company,
          href: ref.href,
          thumbnail: ref.doc.companyLogo,
        },
  )
}

/**
 * Map the authored expectations to slide view-models. The reply is one prose
 * body; split it on blank lines into paragraphs (the render flows them into two
 * balanced columns).
 */
export function expectationViews(
  expectations?: Visitor['expectations'],
  scope = '',
): ExpectationView[] {
  return (expectations ?? []).map((e) => ({
    expectation: e.expectation,
    replyParagraphs: (e.reply ?? '')
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean),
    items: resolveRelevantContent(e.relevantContent, scope),
  }))
}
