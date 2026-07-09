'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'

import { readConsent } from './consent'
import { PageviewTracker } from './PageviewTracker'

/**
 * Client-side PostHog setup. Reads the project key and host exclusively from the
 * environment — values are never hardcoded.
 *
 * Posture: an OPT-IN consent gate layered over storage-free, anonymous analytics.
 * Storage-free + legitimate interest would already justify no banner at all (the
 * earlier "cookieless ⇒ no consent" claim was wrong for a different reason — it
 * conflated *no cookie* with *no storage*; `persistence: 'localStorage'` still
 * wrote a distinct_id to the device = ePrivacy Art. 5(3) storage). We gate on
 * explicit consent anyway, as a trust signal. The two axes it rests on:
 *
 *  - ePrivacy / device storage → CLEARED. `persistence: 'memory'` keeps the
 *    distinct_id in page memory only (nothing written to cookies OR localStorage),
 *    so no consent gate is strictly *owed* on this axis — we run one regardless
 *    (see Consent below). The tradeoff is no cross-day identity (each day = a
 *    fresh anonymous id) — fine at portfolio traffic, where cross-session funnels
 *    were never reliable anyway.
 *  - GDPR / personal data → covered by legitimate interest + transparency, NOT by
 *    anonymisation. We deliberately keep server-side GeoIP on (IP is processed
 *    transiently for coarse geo + bot/datacenter filtering, never stored against
 *    an identity) so "was that hit a human or an AWS bot" stays answerable. The
 *    lawful basis is disclosed on the /privacy notice page.
 *
 * Consent: capturing is opt-out-BY-DEFAULT — nothing is sent until the visitor
 * accepts via the CookieConsent banner. The stored choice is read synchronously
 * here at init (not in an effect) so a returning "accepted" visitor is already
 * opted in before the first $pageview fires, rather than racing it. New/declined
 * visitors init opted out; the banner then drives opt_in/opt_out live. The choice
 * is the only value persisted to the device (see consent.ts).
 *
 * `autocapture` and session recording are OFF (only the named events in events.ts);
 * `respect_dnt` honours Do-Not-Track as a disclosed courtesy (legally inert in the
 * EU, but consistent with the posture); `person_profiles: 'identified_only'` means
 * no person profile is ever built (the site never identifies anyone).
 * See docs/ARCHITECTURE.md (ANALYTICS), docs/RUNBOOK.md (ANALYTICS-ENV), and the
 * /privacy notice.
 *
 * Init runs at MODULE LOAD (client only) rather than in an effect: child effects
 * run before parent effects, so an effect-based init would race the
 * PageviewTracker and drop the first $pageview. Initialising at import time
 * guarantees PostHog is ready before any component effect fires.
 *
 * Ingestion is routed through the app's own `/ingest` reverse proxy (see
 * next.config.ts rewrites) to reduce adblock loss; `ui_host` keeps the PostHog
 * toolbar/links pointing at the real dashboard.
 */
if (typeof window !== 'undefined') {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST

  if (key && !posthog.__loaded) {
    posthog.init(key, {
      api_host: '/ingest',
      ui_host: host,
      capture_pageview: false, // fired manually per route change (App Router soft-nav)
      autocapture: false, // no blanket DOM capture — only our named events
      disable_session_recording: true, // no screen replay
      persistence: 'memory', // storage-free: no persistent tracking id on the device
      respect_dnt: true, // honour Do-Not-Track (disclosed courtesy)
      person_profiles: 'identified_only', // stays anonymous; no profiles created
      // Nothing is captured until the visitor accepts (CookieConsent); a returning
      // "accepted" visitor is opted in from the first render via the stored choice.
      opt_out_capturing_by_default: readConsent() !== 'accepted',
    })
  }
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <PHProvider client={posthog}>
      <PageviewTracker />
      {children}
    </PHProvider>
  )
}
