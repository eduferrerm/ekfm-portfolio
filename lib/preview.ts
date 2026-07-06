import 'server-only'

import { draftMode } from 'next/headers'
import type { Where } from 'payload'

/**
 * Draft-preview plumbing, shared across every draft-enabled collection (see
 * lib/revalidate for the companion publish-time cache bust). Phase 1 wires the
 * Experience collection; Portfolio + Landing adopt the same two helpers as they
 * gain `versions.drafts`.
 *
 * The model: public reads gate on `_status = published`; a request carrying the
 * draft-mode cookie (the owner, via the /preview route) reads the working draft
 * instead. Read {@link isPreview} in a page/layout/detail component (request
 * scope) and thread the boolean down into the queries — NEVER call it from
 * `generateStaticParams` (build scope has no request, and drafts must never
 * pre-render). Reading `draftMode()` is what opts a route into dynamic rendering
 * when the cookie is present, so a normal visitor still gets the statically
 * generated (published) page.
 */

/** True when the current request is previewing unpublished content. */
export async function isPreview(): Promise<boolean> {
  const { isEnabled } = await draftMode()
  return isEnabled
}

/** Payload `where` gate: only documents whose latest published version is live. */
export const PUBLISHED_ONLY: Where = { _status: { equals: 'published' } }

/**
 * Narrow a query to published docs unless previewing. AND-combines the caller's
 * own `where` with the published gate; in preview it returns the where untouched
 * (pair it with `draft: true` on the same `find` to read the working draft).
 */
export function publishedWhere(draft: boolean, where?: Where): Where | undefined {
  if (draft) return where
  return where ? { and: [where, PUBLISHED_ONLY] } : PUBLISHED_ONLY
}
