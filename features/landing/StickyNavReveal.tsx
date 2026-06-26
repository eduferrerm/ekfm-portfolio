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
    const observer = new IntersectionObserver(
      ([entry]) => setRevealed(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      // Trigger as the in-hero copy meets the sticky bar, not the viewport edge.
      { rootMargin: '-56px 0px 0px 0px' },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  const count = items.length + 1 // brand occupies sequence slot 0, links follow

  /** Reveal + stagger classes for sequence slot `seq`. Delays reverse on hide. */
  const reveal = (seq: number) =>
    cn(
      'transition duration-300 ease-out',
      STAGGER_DELAYS[Math.min(revealed ? seq : count - 1 - seq, STAGGER_DELAYS.length - 1)],
      revealed ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0',
      // Keyboard reveal: snap into view (no stagger) when any link is focused.
      'group-focus-within/reveal:translate-y-0 group-focus-within/reveal:opacity-100 group-focus-within/reveal:delay-[0ms]',
    )

  return (
    <div
      className={cn(
        'group/reveal flex items-center gap-6 focus-within:pointer-events-auto',
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
