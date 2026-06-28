import { notFound, redirect } from 'next/navigation'

import { landingSectionAnchor } from '@/features/landing/queries'

// ISR: daily backstop; publishes revalidate on demand (revalidateSite).
export const revalidate = 86400

/**
 * TL;DR is a landing section, not a standalone page. A direct hit on /tldr
 * redirects to the matching landing band anchor (/#<slug>). notFound() if the
 * section isn't configured.
 */
export default async function TldrRedirect() {
  const anchor = await landingSectionAnchor('tldr')
  if (!anchor) notFound()
  redirect(anchor)
}
