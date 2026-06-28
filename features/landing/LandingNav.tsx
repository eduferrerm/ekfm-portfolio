import { Container } from '@/components/Container'
import { SearchPalette } from '@/features/search-palette/SearchPalette'
import type { VisitorSearchContext } from '@/features/search-palette/types'
import type { SearchDocument } from '@/lib/search/types'

import { StickyNavReveal } from './StickyNavReveal'
import type { NavItem } from './NavList'

/**
 * Persistent landing nav — the single canonical `<nav>` landmark. Sticky; the
 * EKFM wordmark sits on the left, and the nav links sit on the right next to Search
 * (one group). The wordmark + links live in `StickyNavReveal`: hidden while the
 * hero's own nav copy is on screen, revealed (staggered) once it scrolls away, so
 * the two nav copies are never both visible at once. Search stays visible at all
 * times and anchors the right edge; it opens the Phase-6 palette, wired to the
 * prebuilt corpus + (for visitors) their personalized empty state.
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
      className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur h-18 lg:h-20 flex items-center"
    >
      <Container className="flex items-center py-3">
        <StickyNavReveal
          items={items}
          search={
            <SearchPalette
              documents={documents}
              visitorSearch={visitorSearch}
              overlayAlign="container"
            />
          }
        />
      </Container>
    </nav>
  )
}
