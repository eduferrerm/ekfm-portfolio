'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'

/**
 * Client-side PostHog provider. Reads the project key and host exclusively
 * from the environment — values are never hardcoded.
 *
 * Ingestion is routed through the app's own `/ingest` reverse proxy (see
 * next.config.ts rewrites) to reduce adblock loss; `ui_host` keeps the PostHog
 * toolbar/links pointing at the real dashboard.
 */
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST

    if (!key) return

    posthog.init(key, {
      api_host: '/ingest',
      ui_host: host,
      capture_pageview: false,
      person_profiles: 'identified_only',
    })
  }, [])

  return <PHProvider client={posthog}>{children}</PHProvider>
}
