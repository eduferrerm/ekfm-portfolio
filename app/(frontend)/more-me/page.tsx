import { notFound, redirect } from 'next/navigation'

import { landingSectionAnchor } from '@/features/landing/queries'

// ISR: daily backstop; publishes revalidate on demand (revalidateSite).
export const revalidate = 86400

/**
 * "More about me" is a landing section, not a standalone page. A direct hit on
 * /more-me redirects to the matching landing band anchor (/#<slug>). The landing
 * section key is `moreAboutMe`. notFound() if the section isn't configured.
 */
export default async function MoreMeRedirect() {
  const anchor = await landingSectionAnchor('moreAboutMe')
  if (!anchor) notFound()
  redirect(anchor)
}
