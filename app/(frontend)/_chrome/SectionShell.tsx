import type { ReactNode } from 'react'

import { Brand } from '@/components/Brand'
import { Container } from '@/components/Container'
import { MenuOverlay } from '@/components/MenuOverlay'
import { SiteNav } from '@/features/menu/SiteNav'
import { SearchPalette } from '@/features/search-palette/SearchPalette'
import type { VisitorSearchContext } from '@/features/search-palette/types'
import type { NavItem, NavSectionView, SectionKey } from '@/lib/nav'
import type { SearchDocument } from '@/lib/search/types'

/**
 * Chrome for the experience/portfolio sections: a global top bar (search +
 * hamburger, brand on the left) over a persistent aside (SiteNav) + content slot,
 * the whole thing capped at 1920px and centred so it never drifts to the edge of
 * an ultrawide display. The brand has two homes by width: below the rail
 * breakpoint (1700px) it sits in the bar next to the hamburger; at/above it the
 * bar's brand hides and the aside carries the brand instead — pulled onto the
 * bar's baseline so the logo doesn't appear to move. On mobile the aside collapses
 * into the shared `MenuOverlay`, which reuses the same SiteNav as its body. This
 * is the app-level composition root that wires the menu + search-palette features
 * together, so neither feature has to import the other sideways.
 */
export function SectionShell({
  active,
  sections,
  items,
  documents,
  visitorSearch,
  home,
  children,
}: {
  active: SectionKey
  sections: NavSectionView[]
  items: NavItem[]
  documents: SearchDocument[]
  visitorSearch?: VisitorSearchContext | null
  /** Visitor scope: the "Dear Company" nav entry + the scoped Brand/home link. */
  home?: { label: string; href: string } | null
  children: ReactNode
}) {
  return (
    <div className="mx-auto min-h-screen w-full max-w-[1920px]">
      {/* Top bar — search + hamburger on the right, brand on the left. The brand
          shows only below the rail breakpoint (1700px); at/above it the aside takes
          over the nav and carries the brand, so the bar's copy hides. */}
      <header>
        <Container className="flex h-(--header-h) items-center">
          <Brand href={home?.href ?? '/'} className="min-[1700px]:hidden" />
          <div className="ml-auto flex items-center gap-2">
            <SearchPalette
              documents={documents}
              visitorSearch={visitorSearch}
              overlayAlign="container"
            />
            <div className="min-[1700px]:hidden">
              <MenuOverlay id="section-mobile-menu" home={home}>
                <SiteNav
                  active={active}
                  sections={sections}
                  items={items}
                  home={home}
                  itemWidth="fit"
                />
              </MenuOverlay>
            </div>
          </div>
        </Container>
      </header>
      <div className="min-[1700px]:grid min-[1700px]:grid-cols-[minmax(180px,1fr)_minmax(0,1200px)_minmax(180px,1fr)]">
        {/* Persistent rail in the left margin. Pulled up one header-height (`-mt`)
            so its brand lands on the top bar's baseline — the bar's own brand is
            hidden up here, so the logo reads as one fixed mark, left-aligned with
            the nav items below it. */}
        <aside className="box-border hidden w-[300px] shrink-0 -mt-[var(--header-h)] px-10 pb-10 min-[1700px]:col-start-1 min-[1700px]:block min-[1700px]:justify-self-start">
          <Brand href={home?.href ?? '/'} className="flex h-(--header-h) items-center" />
          <div className="pt-6">
            <SiteNav active={active} sections={sections} items={items} home={home} />
          </div>
        </aside>
        <main className="min-w-0 min-[1700px]:col-start-2">
          <Container className="py-6">{children}</Container>
        </main>
      </div>
    </div>
  )
}
