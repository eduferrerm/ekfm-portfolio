import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { visitorBySlug } from '@/features/visitor/queries'
import { AnalyticsEvent } from '@/lib/posthog/events'
import { TrackOnMount } from '@/lib/posthog/TrackOnMount'

// The mirror is personalized for one targeted company — never index it (don't
// leak the targeted-company list to search engines). Applies to the whole subtree.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

type Args = {
  params: Promise<{ company: string }>
  children: React.ReactNode
}

/**
 * Guard + scope root for the visitor mirror (`/dear/[company]/...`). Validates the
 * company once for the entire subtree — an unknown OR deactivated company redirects
 * to the canonical site (`/`) before any scoped page renders, so a mistyped, unseeded,
 * or retired link shows the non-personalized portfolio instead of dead-ending, and
 * non-visitors can't browse a half-personalized site. `active === false` (not
 * `!active`) is deliberate: only an explicit opt-out deactivates, so a row whose
 * value is null/undefined (never toggled) stays live. NB: the `active` column must
 * exist in prod BEFORE this code deploys — the build prerenders each mirror and
 * would query a missing column (apply the migration first; see the release steps).
 * The visitor fetch is React.cache()-deduped, so the landing + section layouts that
 * also read it share this one query.
 */
export default async function DearLayout({ params, children }: Args) {
  const { company } = await params
  const visitor = await visitorBySlug(company)
  if (!visitor || visitor.active === false) redirect('/')
  return (
    <>
      {/* Fires once when a visitor enters the /dear/[company] subtree. */}
      <TrackOnMount event={AnalyticsEvent.VisitorPageViewed} properties={{ company }} />
      {children}
    </>
  )
}
