'use client'

import { useEffect, useState } from 'react'

/** How far below the viewport top a band's top must scroll before it counts as
 *  "current" — just under the sticky nav (~56px) plus a little cushion, so the
 *  highlight lands where a clicked `#slug` anchor settles (scroll-mt-24 = 96px). */
const ACTIVATION_OFFSET = 120

/**
 * Scroll-spy for the landing nav: returns the slug of the section currently under
 * the nav so the sticky nav can highlight its link ("current section").
 *
 * The active band is "the last one whose top has scrolled above the activation
 * line" — i.e. the band currently sitting under the nav. Bands are in document
 * order (tops strictly increasing down a single column), so we walk them and take
 * the last with `top <= ACTIVATION_OFFSET`, stopping at the first that hasn't
 * reached the line yet. That deliberately avoids the IntersectionObserver
 * "two bands share a margin band, which one wins?" ambiguity (it reports the
 * scrolled-past one), and a tall band stays current with no null-flicker while you
 * read its middle. Null above the first band (over the hero, where the nav is
 * hidden anyway).
 *
 * Reads ids `slugify(navLabel)` (same source as the nav items). rAF-throttled
 * scroll/resize; keyed on the joined slug list so a fresh array each render
 * doesn't re-subscribe.
 */
export function useActiveSection(slugs: string[]): string | null {
  const [active, setActive] = useState<string | null>(null)
  const key = slugs.join('|')

  useEffect(() => {
    const order = key ? key.split('|') : []
    const sections = order
      .map((slug) => document.getElementById(slug))
      .filter((el): el is HTMLElement => Boolean(el))
    if (sections.length === 0) return

    let frame = 0
    const compute = () => {
      frame = 0
      // A short last band can't scroll its top up to the activation line (the page
      // bottoms out first), so once we've scrolled to the bottom, the last band is
      // current regardless of where its top sits.
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
      if (atBottom) {
        setActive(sections[sections.length - 1].id)
        return
      }
      let current: string | null = null
      for (const el of sections) {
        if (el.getBoundingClientRect().top > ACTIVATION_OFFSET) break
        current = el.id
      }
      setActive(current)
    }
    const onScroll = () => {
      frame ||= requestAnimationFrame(compute)
    }

    compute()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [key])

  return active
}
