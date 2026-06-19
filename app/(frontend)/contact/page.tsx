import { notFound, redirect } from 'next/navigation'

import { landingSectionAnchor } from '@/features/landing/queries'

// ISR: revalidated hourly.
export const revalidate = 3600

/**
 * Contact is a landing section, not a standalone page. A direct hit on /contact
 * redirects to the matching landing band anchor (/#<slug>). notFound() if the
 * section isn't configured.
 */
export default async function ContactRedirect() {
  const anchor = await landingSectionAnchor('contact')
  if (!anchor) notFound()
  redirect(anchor)
}
