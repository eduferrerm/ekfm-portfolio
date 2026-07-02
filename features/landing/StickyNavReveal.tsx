'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { useState } from 'react'

import { MenuOverlay } from '@/components/MenuOverlay'
import { scopeFromPath } from '@/lib/routes'
import { cn } from '@/lib/utils'

import { Brand } from './Brand'
import { NavList, type NavItem } from './NavList'
import { STAGGER_DELAYS } from './navReveal'
import { useActiveSection } from './useActiveSection'

/**
 * The sticky nav row: the EKFM wordmark on the left, and on the right the nav
 * links sitting next to Search (one group). Search stays visible at all times and
 * anchors the right edge; the wordmark + links are hidden while the hero's own nav
 * copy is on screen and reveal — staggered, sliding down from above — once that
 * copy scrolls out of view (and retract on the way back up). An IntersectionObserver
 * on the in-hero copy (`HERO_NAV_SELECTOR`) drives the `revealed` flag.
 *
 * Below `lg` the links give way to the shared `MenuOverlay` hamburger, which sits
 * to the RIGHT of Search and opens the same anchors as a full-screen panel.
 *
 * a11y: the links are always in the DOM (so crawlers/AT see one real nav landmark),
 * and focus reveals them for keyboard users who tab in while they're visually
 * hidden over the hero — they never chase invisible focus. This is JS-driven
 * (`navFocused`) rather than CSS `focus-within` on purpose: `focus-within` would
 * also fire when the always-visible Search button takes focus, and the resulting
 * reveal reflows the row (the hamburger flips from display:none to flex) between
 * a click's pointerdown and pointerup — shifting Search out from under the pointer
 * so the browser drops the `click` and the palette never opens on the first press.
 * So we reveal only when focus lands on a hidden nav item, not on Search.
 *
 * `revealed` (scrolled past the hero) is owned by `LandingNav` via
 * `useRevealedPastHero` and passed in, so the bar background and this row share one
 * observer.
 */
export function StickyNavReveal({
  items,
  search,
  drawerSearch,
  revealed,
}: {
  items: NavItem[]
  /** The top-bar Search trigger — hidden below md, where the drawer carries it. */
  search: ReactNode
  /** The below-md Search twin, rendered inside the hamburger drawer's bottom slot. */
  drawerSearch: ReactNode
  /** Whether the hero has scrolled away — drives the brand/links stagger reveal. */
  revealed: boolean
}) {
  // Keyboard reveal: true while focus is on one of the hidden nav items (brand /
  // links / hamburger) — but NOT on the always-visible Search trigger (see above).
  const [navFocused, setNavFocused] = useState(false)
  const activeSlug = useActiveSection(items.map((item) => item.slug))
  // The overlay logo links home in-scope: `/` on the canonical site, the visitor's
  // own landing under `/dear/[company]` (recovered client-side from the path).
  const scope = scopeFromPath(usePathname())

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
      // Keyboard reveal drops in with no stagger; the scroll reveal staggers.
      navFocused ? 'delay-[0ms]' : STAGGER_DELAYS[Math.min(seq, STAGGER_DELAYS.length - 1)],
      revealed || navFocused ? 'translate-y-0' : '-translate-y-12',
    )

  // Parked (hidden) items shouldn't catch clicks; Search must stay clickable, so
  // pointer-events toggle on the clipped wrappers only, never the whole row.
  // `p-2 -m-2`: the `overflow-hidden` that hides parked items also clips a focused
  // child's outline. The padding gives the ring room to bleed inside the clip box;
  // the matching negative margin cancels it from layout, so spacing is unchanged.
  const clip = cn(
    'overflow-hidden flex items-center p-2 -m-2',
    revealed || navFocused ? 'pointer-events-auto' : 'pointer-events-none',
  )

  // The hamburger mirrors the brand/links: it hides while the hero's own nav copy is
  // on screen (no duplicate entry points) and appears once scrolled past. Below md
  // the in-hero nav never renders, so the hamburger is the sole nav there → always
  // shown. From md up it is HIDDEN at the hero (display:none, so it reserves no width
  // and can't push Search) and shown once `revealed` — or when keyboard focus enters
  // the row, so it's never an unreachable target. (Display, not a translate-park:
  // a parked-but-laid-out box was the empty 58×58 slot shoving Search left.)
  const hamburgerClip = cn(
    'flex items-center p-2 -m-2 pointer-events-auto max-md:translate-x-2',
    revealed || navFocused ? 'md:flex' : 'md:hidden',
  )

  // Reveal on keyboard focus, but only when it lands on a hidden nav item — not on
  // the Search trigger (`data-nav-search`), whose focus must not reflow the row.
  // React focus/blur bubble; blur checks the whole row so intra-row tabs don't flicker.
  const onRowFocus = (e: React.FocusEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement
    // The search palette is portaled to <body> but is a React child of this row, so
    // its focus events (e.g. the input focusing on open) bubble here through the React
    // tree even though their DOM lives outside the row. Ignore anything not a real DOM
    // descendant — otherwise opening the palette would wrongly reveal the nav.
    if (!e.currentTarget.contains(target)) return
    if (target.closest('[data-nav-search]')) return
    setNavFocused(true)
  }
  const onRowBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setNavFocused(false)
  }

  return (
    <div
      className="flex w-full items-center justify-between gap-6"
      onFocus={onRowFocus}
      onBlur={onRowBlur}
    >
      <div className={clip}>
        <Brand className={reveal(0)} />
      </div>
      <div className="flex items-center gap-2 lg:gap-5 ">
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
        {/* `display:contents` marker (layout-neutral) so the focus handler can tell
            the Search trigger apart from the hidden nav items. Below md the bar
            trigger hides (the drawer carries it); the instance stays mounted so it
            still owns Cmd/Ctrl+K there. */}
        <span data-nav-search className="hidden md:contents">
          {search}
        </span>
        {/* Hamburger — the mobile equivalent of the links, to the RIGHT of Search.
            It shares the links' reveal (hidden over the hero's own nav copy, revealed
            once it scrolls away) and opens the same anchors as a full-screen panel. */}
        <div className={cn(hamburgerClip, 'lg:hidden')}>
          <MenuOverlay id="landing-mobile-menu" home={{ href: scope || '/' }} search={drawerSearch}>
            <NavList
              items={items}
              className="flex flex-col gap-5"
              linkClassName="text-nav text-muted-foreground transition hover:text-foreground"
              activeSlug={activeSlug}
              activeLinkClassName="text-foreground underline decoration-primary underline-offset-4"
            />
          </MenuOverlay>
        </div>
      </div>
    </div>
  )
}
