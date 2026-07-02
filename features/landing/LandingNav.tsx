'use client'

import { Container } from '@/components/Container'
import { SearchPalette } from '@/features/search-palette/SearchPalette'
import type { VisitorSearchContext } from '@/features/search-palette/types'
import type { SearchDocument } from '@/lib/search/types'
import { cn } from '@/lib/utils'

import { StickyNavReveal } from './StickyNavReveal'
import type { NavItem } from './NavList'
import { useRevealedPastHero } from './useRevealedPastHero'

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
 *
 * The bar is transparent over the hero (it reads as part of the hero) and fades to
 * the translucent, blurred, hairline-bordered chrome once the hero scrolls away —
 * driven by the same `revealed` flag as the brand/links reveal.
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
  const revealed = useRevealedPastHero()

  return (
    <nav
      aria-label="Primary"
      className={cn(
        'sticky top-0 z-40 h-(--header-h) flex items-center border-b transition-colors duration-200',
        // Over the hero: fully transparent (border colour carried but invisible so
        // the row height never shifts). Past it: the translucent blurred bar.
        revealed
          ? 'border-border/60 bg-background/80 backdrop-blur'
          : 'border-transparent bg-transparent',
      )}
    >
      <Container className="flex items-center py-3">
        <StickyNavReveal
          revealed={revealed}
          items={items}
          search={
            <SearchPalette
              documents={documents}
              visitorSearch={visitorSearch}
              overlayAlign="container"
            />
          }
          // Below-md twin that lives in the hamburger drawer; the bar instance above
          // keeps the global Cmd/Ctrl+K, so this one opts out to avoid a double toggle.
          drawerSearch={
            <SearchPalette
              documents={documents}
              visitorSearch={visitorSearch}
              overlayAlign="container"
              enableGlobalShortcut={false}
            />
          }
        />
      </Container>
    </nav>
  )
}
