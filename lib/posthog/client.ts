'use client'

import posthog from 'posthog-js'

import type {
  AnalyticsEventName,
  AnalyticsEventProperties,
} from './events'

/**
 * Typed wrapper around `posthog.capture` for use in Client Components. Mirrors
 * the server-side `captureServer` contract so event names/payloads stay aligned
 * across both runtimes. Safe no-op if PostHog never initialized.
 */
export function capture<E extends AnalyticsEventName>(
  event: E,
  properties: AnalyticsEventProperties[E],
): void {
  if (!posthog.__loaded) return
  posthog.capture(event, properties)
}
