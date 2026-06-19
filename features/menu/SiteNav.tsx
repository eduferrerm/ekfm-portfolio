'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { MediaImage } from '@/components/primitives/MediaImage'
import type { NavItem, NavSectionView, SectionKey } from '@/lib/nav'

/**
 * The site navigation tree, shared by the desktop aside and the mobile overlay
 * menu (one model, two shells — see _chrome/SectionShell + MobileMenu). The
 * section list comes from the Landing SSOT (`sections`, same rows as LandingNav);
 * under the `active` routed section it expands a nested sub-nav of items
 * (role/feature rows: thumbnail + primary/secondary). The active sub-item is
 * resolved by pathname. IA-first: styling is intentionally minimal pending the
 * design-system branch.
 */
export function SiteNav({
  sections,
  active,
  items,
}: {
  sections: NavSectionView[]
  active: SectionKey
  items: NavItem[]
}) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-2" aria-label="Sections">
      {sections.map((section) => {
        const sectionActive = section.routed && section.key === active
        return (
          <div key={section.key}>
            <Link
              href={section.href}
              aria-current={sectionActive ? 'page' : undefined}
              className={
                sectionActive
                  ? 'text-sm font-medium uppercase tracking-wide text-foreground underline underline-offset-4'
                  : 'text-sm uppercase tracking-wide text-muted-foreground transition hover:text-foreground'
              }
            >
              {section.label}
            </Link>

            {sectionActive && items.length > 0 && (
              <ul className="mt-2 flex flex-col gap-1">
                {items.map((item) => {
                  const itemActive = pathname === item.href
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={itemActive ? 'page' : undefined}
                        className={`flex items-center gap-2 rounded-md p-2 ${
                          itemActive ? 'border border-primary bg-accent/40' : 'hover:bg-accent/30'
                        }`}
                      >
                        {item.thumbnail && (
                          <MediaImage media={item.thumbnail} className="h-8 w-8 shrink-0 rounded" />
                        )}
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-foreground">
                            {item.primary}
                          </span>
                          {item.secondary && (
                            <span className="block truncate text-xs text-muted-foreground">
                              {item.secondary}
                            </span>
                          )}
                        </span>
                      </Link>
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
