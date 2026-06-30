'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import posthog from 'posthog-js'
import { Suspense, useEffect } from 'react'

/**
 * Fires PostHog's canonical `$pageview` on every route change. The App Router's
 * client-side (soft) navigations don't trigger posthog-js's built-in pageview
 * capture, so `capture_pageview` is off (see provider.tsx) and we emit it here on
 * each `pathname`/query change. `$pageview` (not a custom event) powers PostHog's
 * built-in trends/paths/funnels.
 *
 * `useSearchParams` opts a route into client rendering unless wrapped in a
 * Suspense boundary, so the reader lives in an inner component behind <Suspense>.
 */
function PageviewTrackerInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!pathname || !posthog.__loaded) return
    let url = window.origin + pathname
    const query = searchParams.toString()
    if (query) url += `?${query}`
    posthog.capture('$pageview', { $current_url: url })
  }, [pathname, searchParams])

  return null
}

export function PageviewTracker() {
  return (
    <Suspense fallback={null}>
      <PageviewTrackerInner />
    </Suspense>
  )
}
