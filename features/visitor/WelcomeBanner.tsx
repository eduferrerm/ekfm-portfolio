'use client'

import { useEffect, useState } from 'react'

import { Container } from '@/components/Container'
import { MediaImage } from '@/components/primitives/MediaImage'
import type { Media } from '@/payload-types'
import { cn } from '@/lib/utils'

/** How long the banner holds before it animates out (timer starts at entrance). */
const HOLD_MS = 8000

/**
 * Personalized greeting on /dear/[company]: the company avatar, "Welcome
 * {company}", and a fixed greeting from VisitorContent. A one-shot intro —
 * absolutely positioned at the top of the hero (its `relative` ancestor), it
 * slides down in on load (transform only, no fade), holds for {@link HOLD_MS},
 * then slides back up and out and stops rendering for the rest of the session.
 * In-memory only (no storage), so it returns on a hard reload.
 */
export function WelcomeBanner({
  company,
  logo,
  greeting,
}: {
  company: string
  logo?: Media | number | null
  greeting?: string | null
}) {
  // `shown` drives the in/out transform; `gone` unmounts once the exit finishes.
  const [shown, setShown] = useState(false)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    // Flip to shown on the next frame so the transition runs from the hidden
    // initial state (rather than rendering in place), then schedule the exit.
    const enter = requestAnimationFrame(() => setShown(true))
    const exit = setTimeout(() => setShown(false), HOLD_MS)
    return () => {
      cancelAnimationFrame(enter)
      clearTimeout(exit)
    }
  }, [])

  if (gone) return null

  return (
    <div className="pointer-events-none absolute inset-x-0 top-6 z-30">
      <Container>
        <div
          // Once the exit slide finishes, drop it for the session (one-shot).
          onTransitionEnd={(e) => {
            if (e.propertyName === 'transform' && !shown) setGone(true)
          }}
          className={cn(
            'flex w-fit max-w-[20rem] items-center gap-3 rounded-xl bg-primary px-4 py-3 text-primary-foreground shadow-lg transition-transform duration-1000 ease-in-out',
            shown ? 'translate-y-0' : '-translate-y-[30vh]',
          )}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500">
            <MediaImage media={logo} className="h-full w-full object-cover" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-ui-bold">Welcome {company}</p>
            {greeting && <p className="truncate text-meta opacity-80">{greeting}</p>}
          </div>
        </div>
      </Container>
    </div>
  )
}
