'use client'

import { useEffect, useRef } from 'react'

import { capture } from '@/lib/posthog/client'
import { AnalyticsEvent } from '@/lib/posthog/events'

/**
 * Scroll-reach analytics for the one-page landing. Observes each band by its
 * anchor id (the bands already render `id={slugify(navLabel)}`) and fires
 * `section_viewed` the first time a section scrolls into view — once per section,
 * per page load. Renders nothing; it never touches the bands' own markup.
 *
 * A low threshold (any meaningful sliver visible) is deliberate: full-height
 * bands rarely reach a high visibility ratio, and "reached this section" is the
 * signal we want, not "section fully framed".
 */
export function SectionViewTracker({ sections }: { sections: string[] }) {
  const seen = useRef<Set<string>>(new Set())

  useEffect(() => {
    const els = sections
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el))
    if (els.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const { id } = entry.target
          if (seen.current.has(id)) continue
          seen.current.add(id)
          capture(AnalyticsEvent.SectionViewed, { section: id })
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.15 },
    )

    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [sections])

  return null
}
