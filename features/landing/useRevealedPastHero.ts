'use client'

import { useEffect, useState } from 'react'

import { HERO_NAV_SELECTOR } from './navReveal'

/**
 * `true` once the hero's own nav copy has scrolled up past the sticky bar — i.e.
 * the visitor has left the hero. Drives two things off one observer: the sticky
 * nav's staggered brand/links reveal, and the bar's background (transparent over
 * the hero, translucent-blurred once past it). Lives here — not inside
 * `StickyNavReveal` — so `LandingNav` can read it for the bar chrome while passing
 * it down to the row, keeping a single observer as the source of truth.
 */
export function useRevealedPastHero() {
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

  return revealed
}
