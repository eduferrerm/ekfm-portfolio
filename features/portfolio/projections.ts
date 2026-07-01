import type { Media, Portfolio } from '@/payload-types'
import type { NavItem } from '@/lib/nav'
import { resolveContentRefs } from '@/lib/content'
import { proseLines } from '@/lib/prose'
import { portfolioHref } from '@/lib/routes'

/** Project a Portfolio doc (depth>=1) to an aside nav sub-item: eyebrow over title. */
export function portfolioNavItem(
  d: Pick<Portfolio, 'eyebrow' | 'title' | 'slug' | 'thumbnail'>,
  scope = '',
): NavItem {
  return {
    href: portfolioHref(d.slug, scope),
    primary: d.eyebrow,
    secondary: d.title,
    thumbnail: d.thumbnail,
  }
}

/**
 * View-model for one Key Decisions slide — the decision (left) and its
 * conclusion + reasoning (right). Decisions are a top-level array on the piece;
 * the slider cycles them while the section subtitle stays fixed.
 */
export type KeyDecisionView = {
  title: string
  description?: string | null
  conclusion: 'up' | 'down' | 'none'
  points: string[]
}

/**
 * A resolved "Relevant content" card. Follows the shared MetaCard contract
 * (`eyebrow` = content category, `title` = the item's own name) so it renders
 * identically to the Dear Company relevant-content cards.
 */
export type RelatedItem = {
  eyebrow: string
  title: string
  href: string
  thumbnail?: Media | number | null
}

/** Map the authored keyDecisions to slide view-models (drops empty points). */
export function decisionViews(decisions?: Portfolio['keyDecisions']): KeyDecisionView[] {
  return (decisions ?? []).map((decision) => ({
    title: decision.title,
    description: decision.description,
    conclusion: decision.conclusion,
    points: proseLines(decision.points),
  }))
}

/** The persistent Key Decisions subtitle: the authored title, or the eyebrow. */
export function keyDecisionsSubtitle(
  item: Pick<Portfolio, 'keyDecisionsTitle' | 'eyebrow'>,
): string {
  return item.keyDecisionsTitle?.trim() || item.eyebrow
}

/**
 * Resolve the polymorphic `relatedContent` relationship to MetaCard data. The
 * narrowing, slug guard, and route shape live in `resolveContentRefs`; here we
 * only shape the card, mirroring the Dear Company resolver: Portfolio →
 * "Feature" + eyebrow + thumbnail; Experience → "Experience" + company + logo.
 */
export function relatedItems(related?: Portfolio['relatedContent'], scope = ''): RelatedItem[] {
  return resolveContentRefs(related, scope).map((ref) =>
    ref.relationTo === 'portfolio'
      ? {
          eyebrow: 'Feature',
          title: ref.doc.eyebrow,
          href: ref.href,
          thumbnail: ref.doc.thumbnail,
        }
      : {
          eyebrow: 'Experience',
          title: ref.doc.company,
          href: ref.href,
          thumbnail: ref.doc.companyLogo,
        },
  )
}
