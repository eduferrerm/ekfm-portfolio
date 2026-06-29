'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { MetaCard } from '@/components/primitives/MetaCard'
import { DEAR_COMPANY_ID, type NavItem, type NavSectionView, type SectionKey } from '@/lib/nav'
import { cn } from '@/lib/utils'

/**
 * The site navigation tree, shared by the desktop aside and the mobile overlay
 * menu (one model, two shells — the aside in _chrome/SectionShell + the shared
 * MenuOverlay it opens below the rail breakpoint). Both shells own their own brand
 * mark, so this renders only the nav itself. The section list comes from the
 * Landing SSOT (`sections`, same rows as LandingNav); under the `active` routed
 * section it expands a nested sub-nav of items (role/feature rows: thumbnail +
 * primary/secondary). The active sub-item is resolved by pathname.
 */
export function SiteNav({
  sections,
  active,
  items,
  home,
  itemWidth = 'fill',
}: {
  sections: NavSectionView[]
  active: SectionKey
  items: NavItem[]
  /** Visitor-only "Dear Company" entry linking back to the scoped landing. */
  home?: { label: string; href: string } | null
  /**
   * Sub-item row width. The fixed-width aside fills its rail (`'fill'`); the
   * full-bleed overlay hugs each row to its content (`'fit'`) so a card doesn't
   * stretch the whole 1200px column.
   */
  itemWidth?: 'fill' | 'fit'
}) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-6" aria-label="Sections">
        {home && (
          // The "Dear Company" entry scrolls back to the landing's dear-company
          // band, so it targets that anchor — `home.href` itself stays the scoped
          // landing root (the Brand/logo's home), which lands on the hero instead.
          <Link
            href={`${home.href}/#${DEAR_COMPANY_ID}`}
            className="text-nav text-muted-foreground transition hover:text-foreground"
          >
            {home.label}
          </Link>
        )}
        {sections.map((section) => {
          const sectionActive = section.routed && section.key === active
          return (
            <div key={section.key}>
              <Link
                href={section.href}
                aria-current={sectionActive ? 'page' : undefined}
                className={
                  sectionActive
                    ? 'text-nav text-foreground underline decoration-primary underline-offset-4'
                    : 'text-nav text-muted-foreground transition hover:text-foreground'
                }
              >
                {section.label}
              </Link>

              {sectionActive && items.length > 0 && (
                <ul
                  className={cn(
                    'mt-2 flex flex-col gap-1',
                    // 'fit' aligns rows to the start so each shrinks to its content.
                    itemWidth === 'fit' && 'items-start',
                  )}
                >
                  {items.map((item) => {
                    const itemActive = pathname === item.href
                    return (
                      <li key={item.href}>
                        {/* The item's own name is the regular-foreground line; its
                            descriptor rides above as the bold-muted eyebrow — the
                            shared MetaCard treatment, identical to the search and
                            Expectations rows. */}
                        <MetaCard
                          href={item.href}
                          aria-current={itemActive ? 'page' : undefined}
                          eyebrow={item.secondary}
                          title={item.primary}
                          thumbnail={item.thumbnail}
                          active={itemActive}
                        />
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )
        })}
      </nav>
  )
}
