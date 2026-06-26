'use client'

import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

import { Brand } from './Brand'
import { NavList, type NavItem } from './NavList'
import { HERO_NAV_SELECTOR, STAGGER_DELAYS } from './navReveal'

/**
 * The sticky nav's revealable group: the EKFM wordmark + the nav links. Search
 * lives outside this group (in `LandingNav`) so it stays visible at all times;
 * this group is hidden while the hero's own nav copy is on screen and reveals —
 * staggered — once that copy scrolls out of view (and retracts, reversed, on the
 * way back up). An IntersectionObserver on the in-hero copy (`HERO_NAV_SELECTOR`)
 * drives the `revealed` flag.
 *
 * a11y: the group is always in the DOM (so crawlers/AT see one real nav landmark),
 * and `focus-within` reveals it for keyboard users who tab in while it's visually
 * hidden over the hero — they never chase invisible focus.
 */
export function StickyNavReveal({ items }: { items: NavItem[] }) {
  const [revealed, setRevealed] = useState(false)

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
   * the group's `overflow-hidden` clips it while parked above. The same ascending
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

  return (
    <div
      className={cn(
        'group/reveal flex items-center gap-6 overflow-hidden focus-within:pointer-events-auto',
        revealed ? 'pointer-events-auto' : 'pointer-events-none',
      )}
    >
      <Brand className={reveal(0)} />
      <NavList
        items={items}
        className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm"
        linkClassName="uppercase tracking-wide text-muted-foreground transition hover:text-foreground"
        itemClassName={(i) => reveal(i + 1)}
      />
    </div>
  )
}
