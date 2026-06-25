import { Container } from '@/components/Container'
import { SearchPalette } from '@/features/search-palette/SearchPalette'
import type { VisitorSearchContext } from '@/features/search-palette/types'
import type { SearchDocument } from '@/lib/search/types'

/**
 * Persistent landing nav. Anchors derive from the Landing global's section
 * `navLabel`s (slugified upstream), so the nav, the band ids, and the search
 * docs all stay in sync. Sticky; the reveal-on-scroll animation (hidden over the
 * hero) is deferred. The Search affordance opens the Phase-6 palette, wired to
 * the prebuilt corpus + (for visitors) their personalized empty state.
 */
export function LandingNav({
  items,
  documents,
  visitorSearch,
}: {
  items: { label: string; slug: string }[]
  documents: SearchDocument[]
  visitorSearch?: VisitorSearchContext | null
}) {
  return (
    <nav className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <Container className="flex items-center justify-between gap-6 py-3">
        <span className="rounded border border-primary px-2 py-0.5 text-sm font-bold tracking-widest text-primary">
          EKFM
        </span>
        <ul className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
          {items.map((item) => (
            <li key={item.slug}>
              <a
                href={`#${item.slug}`}
                className="uppercase tracking-wide text-muted-foreground transition hover:text-foreground"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
        <SearchPalette
          documents={documents}
          visitorSearch={visitorSearch}
          overlayAlign="container"
        />
      </Container>
    </nav>
  )
}
