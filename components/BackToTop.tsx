'use client'

import { TextLink } from '@/components/TextLink'

/**
 * "Back to top" control — a design-system `TextLink` rendered as a button that
 * smooth-scrolls to the top of the page. Coloured for the lime footer ground
 * (dark label, opacity-shift hover, lime focus-ring offset). Lives in the footer
 * bar, which is shared across the landing (fixed reveal) and inner pages (in-flow).
 */
export function BackToTop() {
  return (
    <TextLink
      className="text-primary-foreground hover:opacity-70 focus-visible:ring-offset-primary"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      Back to top
    </TextLink>
  )
}
