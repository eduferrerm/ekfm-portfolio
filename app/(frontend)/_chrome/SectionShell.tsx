import type { ReactNode } from 'react'

import { Brand } from '@/components/Brand'
import { Container } from '@/components/Container'
import { SiteNav } from '@/features/menu/SiteNav'
import { SearchPalette } from '@/features/search-palette/SearchPalette'
import type { VisitorSearchContext } from '@/features/search-palette/types'
import type { NavItem, NavSectionView, SectionKey } from '@/lib/nav'
import type { SearchDocument } from '@/lib/search/types'

import { MobileMenu } from './MobileMenu'

/**
 * Chrome for the experience/portfolio sections: a global top bar (brand + search)
 * over a persistent aside (SiteNav) + content slot. On mobile the aside collapses
 * into MobileMenu's overlay, which reuses the same SiteNav. This is the app-level
 * composition root that wires the menu + search-palette features together, so
 * neither feature has to import the other sideways.
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
    <div className="min-h-screen">
      {/* Top bar. Above the rail breakpoint the brand lives in the aside, so the
          header shows only search; below it (hamburger layout) the aside is gone,
          so the brand fades back into the header. Pure CSS: the media query flips
          opacity and the transition animates it (300ms ease-out-quad) when the
          viewport crosses 1822px — no JS rerender. pointer-events-none keeps the
          invisible copy unclickable above the breakpoint. */}
      <header>
        <Container className="flex items-center py-4">
          <Brand
            href={home?.href ?? '/'}
            className="transition-opacity duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] min-[1822px]:pointer-events-none min-[1822px]:opacity-0"
          />
          <div className="ml-auto flex items-center gap-2">
            <SearchPalette
              documents={documents}
              visitorSearch={visitorSearch}
              overlayAlign="container"
            />
            <MobileMenu active={active} sections={sections} items={items} home={home} />
          </div>
        </Container>
      </header>

      {/* Body. Content sits in the viewport-centered column (Container, ≤1200px).
          From the rail breakpoint up, a grid parks the aside in the LEFT MARGIN
          (col 1, justify-self-start → at the margin's start) WITHOUT pushing the
          content off-centre, so the content + the top-bar search + the portaled
          overlay all stay aligned to the same 1200px column. The side tracks have
          a floor of N = the aside's width (311px) so the nav never clips. The rail
          shows once 1200 + 2N fits; below that the hamburger takes over (MobileMenu).
          Breakpoint = 1200 + 2×311 = 1822px — move it with N if the aside resizes. */}
      <div className="min-[1822px]:grid min-[1822px]:grid-cols-[minmax(311px,1fr)_minmax(0,1200px)_minmax(311px,1fr)]">
        <aside className="hidden w-[311px] shrink-0 border-r border-border p-6 min-[1822px]:col-start-1 min-[1822px]:block min-[1822px]:justify-self-start">
          <SiteNav active={active} sections={sections} items={items} home={home} />
        </aside>
        <main className="min-w-0 min-[1822px]:col-start-2">
          <Container className="py-6">{children}</Container>
        </main>
      </div>
    </div>
  )
}
