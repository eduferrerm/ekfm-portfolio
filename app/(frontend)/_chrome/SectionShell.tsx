import type { ReactNode } from 'react'

import { Brand } from '@/components/Brand'
import { Container } from '@/components/Container'
import { MenuOverlay } from '@/components/MenuOverlay'
import { SiteNav } from '@/features/menu/SiteNav'
import { SearchPalette } from '@/features/search-palette/SearchPalette'
import type { VisitorSearchContext } from '@/features/search-palette/types'
import type { NavItem, NavSectionView, SectionKey } from '@/lib/nav'
import type { SearchDocument } from '@/lib/search/types'
import { cn } from '@/lib/utils'

/**
 * Chrome for the experience/portfolio sections: a global top bar (search +
 * hamburger, brand on the left) over a persistent aside (SiteNav) + content slot,
 * the whole thing capped at 1920px and centred so it never drifts to the edge of
 * an ultrawide display. The brand has two homes by width: below the rail
 * breakpoint it sits in the bar next to the hamburger; at/above it the bar's brand
 * hides and the aside carries the brand instead — pulled onto the bar's baseline
 * so the logo doesn't appear to move. On mobile the aside collapses into the
 * shared `MenuOverlay`, which reuses the same SiteNav as its body. This is the
 * app-level composition root that wires the menu + search-palette features
 * together, so neither feature has to import the other sideways.
 *
 * Experience detail reads in a tighter 964px column (set per the section, not in
 * the shared `Container`); everything else keeps the 1200px column. Because the
 * body width is what decides how much margin the aside needs, the rail breakpoint
 * moves with it: 964 + ~2×258 ≈ 1480, mirroring 1200 + ~2×250 = 1700. Both class
 * sets are spelled out in full because a Tailwind arbitrary breakpoint can't be
 * templated at runtime.
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
  const narrow = active === 'experience'
  const layout = narrow
    ? {
        grid: 'min-[1480px]:grid min-[1480px]:grid-cols-[minmax(180px,1fr)_minmax(0,964px)_minmax(180px,1fr)]',
        railHidden: 'min-[1480px]:hidden',
        asideShown: 'min-[1480px]:col-start-1 min-[1480px]:block min-[1480px]:justify-self-start',
        mainCol: 'min-[1480px]:col-start-2',
        bodyMax: 'max-w-[964px]',
      }
    : {
        grid: 'min-[1700px]:grid min-[1700px]:grid-cols-[minmax(180px,1fr)_minmax(0,1200px)_minmax(180px,1fr)]',
        railHidden: 'min-[1700px]:hidden',
        asideShown: 'min-[1700px]:col-start-1 min-[1700px]:block min-[1700px]:justify-self-start',
        mainCol: 'min-[1700px]:col-start-2',
        bodyMax: 'max-w-[1200px]',
      }

  return (
    <div className="mx-auto min-h-screen w-full max-w-[1920px] pb-20">
      {/* Top bar — search + hamburger on the right, brand on the left. The brand
          shows only below the rail breakpoint; at/above it the aside takes over
          the nav and carries the brand, so the bar's copy hides. */}
      <header>
        <Container className="flex h-(--header-h) items-center">
          <Brand href={home?.href ?? '/'} className={layout.railHidden} />
          <div className="ml-auto flex items-center gap-2">
            <SearchPalette
              documents={documents}
              visitorSearch={visitorSearch}
              overlayAlign="container"
            />
            <div className={layout.railHidden}>
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
      <div className={layout.grid}>
        {/* Persistent rail in the left margin. Pulled up one header-height (`-mt`)
            so its brand lands on the top bar's baseline — the bar's own brand is
            hidden up here, so the logo reads as one fixed mark, left-aligned with
            the nav items below it. */}
        <aside
          className={cn(
            'box-border hidden w-[300px] shrink-0 -mt-[var(--header-h)] px-10 pb-10',
            layout.asideShown,
          )}
        >
          <Brand href={home?.href ?? '/'} className="flex h-(--header-h) items-center" />
          <div className="pt-6">
            <SiteNav active={active} sections={sections} items={items} home={home} />
          </div>
        </aside>
        <main className={cn('min-w-0', layout.mainCol)}>
          {/* Body column — the Container styles extracted (centred, `px-6` gutter)
              so the max-width can vary by section without editing the shared
              Container SSOT. */}
          <div className={cn('mx-auto w-full px-6 py-6', layout.bodyMax)}>{children}</div>
        </main>
      </div>
    </div>
  )
}
