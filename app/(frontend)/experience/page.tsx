import { notFound, redirect } from 'next/navigation'

import { firstExperienceSlug } from '@/features/experience/queries'

// ISR: revalidated hourly.
export const revalidate = 3600

/**
 * Experience has no standalone landing page — it's reached via the landing
 * section (cards) and search. Visiting `/experience` directly redirects to the
 * most recent role (newest `startDate`), mirroring the portfolio index.
 */
export default async function ExperienceIndex() {
  const slug = await firstExperienceSlug()
  if (!slug) notFound()
  redirect(`/experience/${slug}`)
}
