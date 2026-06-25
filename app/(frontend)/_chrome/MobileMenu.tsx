'use client'

import { useState } from 'react'

import { SiteNav } from '@/features/menu/SiteNav'
import type { NavItem, NavSectionView, SectionKey } from '@/lib/nav'

/**
 * Mobile/tablet nav: a hamburger in the top bar that opens a full-screen overlay
 * holding the same SiteNav as the desktop aside (one nav model, two shells).
 * Hidden at md+, where the persistent aside takes over. Tapping a nav link closes
 * the overlay (the wrapper's onClick). IA-first; styling lands with the design
 * system.
 */
export function MobileMenu({
  active,
  sections,
  items,
  home,
}: {
  active: SectionKey
  sections: NavSectionView[]
  items: NavItem[]
  home?: { label: string; href: string } | null
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="rounded-md border border-border px-3 py-1 text-sm"
      >
        Menu
      </button>

      {open && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-background p-6">
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="absolute right-6 top-6 text-2xl leading-none text-primary"
          >
            ×
          </button>
          <div className="mt-10" onClick={() => setOpen(false)}>
            <SiteNav active={active} sections={sections} items={items} home={home} />
          </div>
        </div>
      )}
    </div>
  )
}
