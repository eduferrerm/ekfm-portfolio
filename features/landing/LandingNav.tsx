import { Container } from '@/components/Container'
import { SearchPalette } from '@/features/search-palette/SearchPalette'
import type { VisitorSearchContext } from '@/features/search-palette/types'
import type { SearchDocument } from '@/lib/search/types'

import { StickyNavReveal } from './StickyNavReveal'
import type { NavItem } from './NavList'

/**
 * Persistent landing nav — the single canonical `<nav>` landmark. Sticky; Search
 * is always visible. The wordmark + nav links live in `StickyNavReveal`: hidden
 * while the hero's own nav copy is on screen, revealed (staggered) once it scrolls
 * away, so the two nav copies are never both visible at once. The Search affordance
 * opens the Phase-6 palette, wired to the prebuilt corpus + (for visitors) their
 * personalized empty state.
 *
 * Anchors derive from the Landing global's section `navLabel`s (slugified
 * upstream), so the nav, the band ids, and the search docs all stay in sync.
 */
export function LandingNav({
  items,
  documents,
  visitorSearch,
}: {
  items: NavItem[]
  documents: SearchDocument[]
  visitorSearch?: VisitorSearchContext | null
}) {
  return (
    <nav
      aria-label="Primary"
      className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur"
    >
      <Container className="flex items-center justify-between gap-6 py-3">
        <StickyNavReveal items={items} />
        <SearchPalette
          documents={documents}
          visitorSearch={visitorSearch}
          overlayAlign="container"
        />
      </Container>
    </nav>
  )
}
