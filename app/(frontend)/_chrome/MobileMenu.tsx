'use client'

import { X } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { SiteNav } from '@/features/menu/SiteNav'
import type { NavItem, NavSectionView, SectionKey } from '@/lib/nav'

/**
 * Compact nav: a hamburger in the top bar that opens a full-screen overlay
 * holding the same SiteNav as the persistent aside (one nav model, two shells).
 * Shown until the rail breakpoint (1822px = 1200px content + 2×311px aside), the
 * point at which there's margin to park the persistent aside; above it the aside
 * takes over. Tapping a nav link closes the overlay (the wrapper's onClick).
 * IA-first; styling lands with the design system.
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
    <div className="min-[1822px]:hidden">
      <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(true)}>
        <span className="text-eyebrow">Menu</span>
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-background p-6">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="absolute right-4 top-4 text-primary"
          >
            <X className="h-6 w-6" />
          </Button>
          <div className="mt-10" onClick={() => setOpen(false)}>
            <SiteNav active={active} sections={sections} items={items} home={home} />
          </div>
        </div>
      )}
    </div>
  )
}
