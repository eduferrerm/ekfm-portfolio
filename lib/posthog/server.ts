import 'server-only'

import { PostHog } from 'posthog-node'

import type { AnalyticsEventName, AnalyticsEventProperties } from './events'

/**
 * Server-side PostHog client (posthog-node). Lives in the analytics domain and
 * is the only path for capturing events from Server Components, Route Handlers,
 * and Payload hooks. Key/host come exclusively from the environment.
 *
 * In serverless we flush immediately (flushAt:1) so events aren't lost when the
 * function freezes; callers should still `await captureServer(...)`.
 */
let client: PostHog | null = null

function getClient(): PostHog | null {
  if (client) return client

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST
  if (!key) return null

  client = new PostHog(key, {
    host,
    flushAt: 1,
    flushInterval: 0,
  })
  return client
}

/** Capture a typed analytics event from the server. No-op if PostHog is unset. */
export async function captureServer<E extends AnalyticsEventName>(
  distinctId: string,
  event: E,
  properties: AnalyticsEventProperties[E],
): Promise<void> {
  const ph = getClient()
  if (!ph) return

  ph.capture({ distinctId, event, properties })
  await ph.flush()
}
