'use client'

import Link from 'next/link'
import posthog from 'posthog-js'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { TextLink } from '@/components/TextLink'
import {
  hasDoNotTrack,
  readConsent,
  syncPosthogConsent,
  writeConsent,
  type ConsentChoice,
} from '@/lib/posthog/consent'

/**
 * Analytics consent banner. Capturing is opt-out-by-default (see provider.tsx),
 * so nothing is tracked until the visitor clicks Accept here — this is the UI half
 * of "consider whether the user gave consent".
 *
 * Shown only on a first visit with no stored choice, and never when Do-Not-Track
 * is set (those visitors are left alone). SSR-safe: it renders nothing on the
 * server and on the first client paint, then decides in an effect once storage is
 * readable, so there's no hydration mismatch and no flash for returning visitors.
 */
export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const stored = readConsent()
    // Re-assert the stored choice against PostHog on every load (idempotent): the
    // init flag covers "accepted", this also covers an explicit "declined".
    syncPosthogConsent(stored)
    if (!stored && !hasDoNotTrack()) setVisible(true)
  }, [])

  const choose = (choice: ConsentChoice) => {
    writeConsent(choice)
    syncPosthogConsent(choice)
    // The current page's initial $pageview fired while opted out (and was dropped);
    // capture it now so an accepting visitor's landing view isn't lost. Later
    // navigations are covered by PageviewTracker.
    if (choice === 'accepted' && posthog.__loaded) {
      posthog.capture('$pageview', { $current_url: window.location.href })
    }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed inset-x-0 bottom-4 z-[150] flex justify-center px-4">
      <div className="flex w-full max-w-2xl flex-col gap-3 rounded-2xl border border-border-card bg-card p-4 shadow-lg sm:flex-row sm:items-center">
        <p className="text-card-body text-foreground">
          🍪 I use privacy-first, anonymous analytics to see what’s useful — nothing is tracked
          unless you accept.{' '}
          <TextLink asChild className="text-foreground hover:text-primary">
            <Link href="/privacy">Privacy details</Link>
          </TextLink>
        </p>
        <div className="flex shrink-0 items-center gap-2 sm:ml-auto">
          <Button variant="secondary" size="sm" onClick={() => choose('declined')}>
            Decline
          </Button>
          <Button variant="primary" size="sm" onClick={() => choose('accepted')}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  )
}
