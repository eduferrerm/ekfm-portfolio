'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'

import { PageviewTracker } from './PageviewTracker'

/**
 * Client-side PostHog setup. Reads the project key and host exclusively from the
 * environment — values are never hardcoded.
 *
 * Posture: zero-invasive, cookieless, anonymous. `autocapture` and session
 * recording are OFF (we only emit the handful of named events in events.ts);
 * `persistence: 'localStorage'` keeps the anonymous id out of cookies entirely
 * (no consent banner), while still letting one browser count as one visitor so
 * usage numbers are honest; `respect_dnt` honours Do-Not-Track; and
 * `person_profiles: 'identified_only'` means no person profile is ever built
 * (the site never identifies anyone). See docs/ARCHITECTURE.md (ANALYTICS).
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
      persistence: 'localStorage', // cookieless: no cookie, no consent banner
      respect_dnt: true, // honour Do-Not-Track
      person_profiles: 'identified_only', // stays anonymous; no profiles created
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
