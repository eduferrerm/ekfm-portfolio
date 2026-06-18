import type { Portfolio } from '@/payload-types'

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
    points: (decision.points ?? [])
      .map((p) => p.text)
      .filter((text): text is string => Boolean(text)),
  }))
}

/** The persistent Key Decisions subtitle: the authored title, or the eyebrow. */
export function keyDecisionsSubtitle(item: Pick<Portfolio, 'keyDecisionsTitle' | 'eyebrow'>): string {
  return item.keyDecisionsTitle?.trim() || item.eyebrow
}

/**
 * Resolve the polymorphic `relatedContent` relationship to title + href. Needs a
 * depth>=1 query (values populated to docs); unpopulated ids are skipped.
 */
export function relatedItems(related?: Portfolio['relatedContent']): RelatedItem[] {
  return (related ?? [])
    .map((rel): RelatedItem | null => {
      // Check the discriminant first so `rel.value` narrows to the matching doc.
      if (rel.relationTo === 'portfolio') {
        const value = rel.value
        if (typeof value !== 'object' || !value || !value.slug) return null
        return { title: value.eyebrow, href: `/portfolio/${value.slug}` }
      }
      const value = rel.value
      if (typeof value !== 'object' || !value || !value.slug) return null
      return { title: `${value.role} · ${value.company}`, href: `/experience/${value.slug}` }
    })
    .filter((item): item is RelatedItem => Boolean(item))
}
