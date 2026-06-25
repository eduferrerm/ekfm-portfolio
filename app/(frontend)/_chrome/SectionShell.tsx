import type { ReactNode } from 'react'

import { Brand } from '@/components/Brand'
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
  children,
}: {
  active: SectionKey
  sections: NavSectionView[]
  items: NavItem[]
  documents: SearchDocument[]
  visitorSearch?: VisitorSearchContext | null
  children: ReactNode
}) {
  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between gap-4 px-6 py-4">
        <Brand />
        <div className="flex items-center gap-2">
          <SearchPalette documents={documents} visitorSearch={visitorSearch} />
          <MobileMenu active={active} sections={sections} items={items} />
        </div>
      </header>

      <div className="flex">
        <aside className="hidden w-56 shrink-0 border-r border-border p-4 md:block">
          <SiteNav active={active} sections={sections} items={items} />
        </aside>
        <main className="min-w-0 flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
