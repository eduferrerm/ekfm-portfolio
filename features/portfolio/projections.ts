import type { Portfolio } from '@/payload-types'
import type { NavItem } from '@/lib/nav'
import { resolveContentRefs } from '@/lib/content'
import { proseLines } from '@/lib/prose'
import { portfolioHref } from '@/lib/routes'

/** Project a Portfolio doc (depth>=1) to an aside nav sub-item: eyebrow over title. */
export function portfolioNavItem(
  d: Pick<Portfolio, 'eyebrow' | 'title' | 'slug' | 'thumbnail'>,
): NavItem {
  return {
    href: portfolioHref(d.slug),
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
  conclusion: 'up' | 'down'
  points: string[]
}

/** A resolved "Relevant content" link (Portfolio item or Experience role). */
export type RelatedItem = {
  title: string
  href: string
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
export function keyDecisionsSubtitle(item: Pick<Portfolio, 'keyDecisionsTitle' | 'eyebrow'>): string {
  return item.keyDecisionsTitle?.trim() || item.eyebrow
}

/**
 * Resolve the polymorphic `relatedContent` relationship to title + href. The
 * narrowing, slug guard, and route shape live in `resolveContentRefs`; here we
 * only shape the label: a portfolio piece shows its eyebrow, a role shows
 * "{role} · {company}".
 */
export function relatedItems(related?: Portfolio['relatedContent']): RelatedItem[] {
  return resolveContentRefs(related).map((ref) =>
    ref.relationTo === 'portfolio'
      ? { title: ref.doc.eyebrow, href: ref.href }
      : { title: `${ref.doc.role} · ${ref.doc.company}`, href: ref.href },
  )
}
