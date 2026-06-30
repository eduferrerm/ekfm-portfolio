'use client'

import { useEffect } from 'react'

import { capture } from './client'
import type { AnalyticsEventName, AnalyticsEventProperties } from './events'

/**
 * Fires a single typed analytics event once when it mounts — the client bridge
 * for "this server-rendered page was opened" signals (a portfolio detail, a
 * visitor mirror). Renders nothing. Because it remounts per navigation, the
 * once-on-mount fire maps cleanly to "the page was opened".
 */
export function TrackOnMount<E extends AnalyticsEventName>({
  event,
  properties,
}: {
  event: E
  properties: AnalyticsEventProperties[E]
}) {
  useEffect(() => {
    capture(event, properties)
    // Fire exactly once per mount; props are fixed for a given opened page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
