'use client'

import { Menu, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { Brand } from './Brand'
import { NavList, type NavItem } from './NavList'
import { HERO_NAV_SELECTOR, STAGGER_DELAYS } from './navReveal'
import { useActiveSection } from './useActiveSection'

/**
 * The sticky nav row: the EKFM wordmark on the left, and on the right the nav
 * links sitting next to Search (one group). Search stays visible at all times and
 * anchors the right edge; the wordmark + links are hidden while the hero's own nav
 * copy is on screen and reveal — staggered, sliding down from above — once that
 * copy scrolls out of view (and retract on the way back up). An IntersectionObserver
 * on the in-hero copy (`HERO_NAV_SELECTOR`) drives the `revealed` flag.
 *
 * a11y: the links are always in the DOM (so crawlers/AT see one real nav landmark),
 * and `focus-within` reveals them for keyboard users who tab in while they're
 * visually hidden over the hero — they never chase invisible focus.
 */
export function StickyNavReveal({ items, search }: { items: NavItem[]; search: ReactNode }) {
  const [revealed, setRevealed] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const activeSlug = useActiveSection(items.map((item) => item.slug))

  // While the mobile overlay is open, lock background scroll and let Escape close
  // it — the standard modal affordances the inline desktop row doesn't need.
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [menuOpen])

  useEffect(() => {
    const sentinel = document.querySelector(HERO_NAV_SELECTOR)
    if (!sentinel) return
    // The in-hero copy can only ever leave through the TOP (it sits at the top of
    // the page), so "not intersecting the inset viewport" == "scrolled above the
    // sticky bar" — reveal then. Don't also gate on boundingClientRect.top < 0: the
    // copy stops intersecting the moment its BOTTOM clears the rootMargin line, when
    // its top is still positive, so that guard dropped the single crossing callback
    // on slow scrolls and the nav never rendered.
    const observer = new IntersectionObserver(
      ([entry]) => setRevealed(!entry.isIntersecting),
      // Trigger as the in-hero copy meets the sticky bar, not the viewport edge.
      { rootMargin: '-56px 0px 0px 0px' },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  /**
   * Reveal + stagger classes for sequence slot `seq` (brand is 0, links follow).
   * Each item slides down from above its row into place (transform only, no fade);
   * an `overflow-hidden` wrapper clips it while parked above. The same ascending
   * delay runs both ways, so the retract starts immediately rather than waiting out
   * a reversed delay — which previously read as "the stagger didn't happen".
   */
  const reveal = (seq: number) =>
    cn(
      'transition-transform duration-200 ease-out',
      STAGGER_DELAYS[Math.min(seq, STAGGER_DELAYS.length - 1)],
      revealed ? 'translate-y-0' : '-translate-y-12',
      // Keyboard reveal: drop into view (no stagger) when any link is focused.
      'group-focus-within/reveal:translate-y-0 group-focus-within/reveal:delay-[0ms]',
    )

  // Parked (hidden) items shouldn't catch clicks; Search must stay clickable, so
  // pointer-events toggle on the clipped wrappers only, never the whole row.
  // `p-2 -m-2`: the `overflow-hidden` that hides parked items also clips a focused
  // child's outline. The padding gives the ring room to bleed inside the clip box;
  // the matching negative margin cancels it from layout, so spacing is unchanged.
  const clip = cn(
    'overflow-hidden group-focus-within/reveal:pointer-events-auto flex items-center p-2 -m-2',
    revealed ? 'pointer-events-auto' : 'pointer-events-none',
  )

  return (
    <div className="group/reveal flex w-full items-center justify-between gap-6">
      <div className={clip}>
        <Brand className={reveal(0)} />
      </div>
      <div className="flex items-center gap-5">
        {/* Inline links — the desktop row. Below `lg` the full set can't fit, so it
            gives way to the hamburger (which would otherwise overflow horizontally). */}
        <div className={cn(clip, 'hidden lg:block')}>
          <NavList
            items={items}
            className="flex items-center gap-x-5 gap-y-1"
            linkClassName="text-nav text-muted-foreground transition hover:text-foreground"
            itemClassName={(i) => reveal(i + 1)}
            activeSlug={activeSlug}
            activeLinkClassName="text-foreground underline decoration-primary underline-offset-4"
          />
        </div>
        {/* Hamburger — the mobile equivalent of the links, so it follows the same
            reveal (hidden over the hero's own nav copy, revealed once it scrolls away). */}
        <div className={cn(clip, 'lg:hidden')}>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="landing-mobile-menu"
            className={reveal(1)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
        {search}
      </div>

      {/* Full-screen overlay holding the same anchor links, vertical. Rendered only
          when open, so the duplicated links never sit in the a11y tree alongside the
          inline row; tapping any link bubbles to the wrapper and closes it. */}
      {menuOpen && (
        <div
          id="landing-mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-50 flex flex-col bg-background p-6 lg:hidden"
        >
          <div className="flex items-center justify-between">
            <Brand />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
          <div className="mt-12" onClick={() => setMenuOpen(false)}>
            <NavList
              items={items}
              className="flex flex-col gap-5"
              linkClassName="text-nav text-muted-foreground transition hover:text-foreground"
              activeSlug={activeSlug}
              activeLinkClassName="text-foreground underline decoration-primary underline-offset-4"
            />
          </div>
        </div>
      )}
    </div>
  )
}
