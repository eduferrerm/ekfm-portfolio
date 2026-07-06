import { notFound, redirect } from 'next/navigation'

import { firstExperienceSlug } from '@/features/experience/queries'
import { isPreview } from '@/lib/preview'

// ISR: daily backstop; publishes revalidate on demand (revalidateSite).
export const revalidate = 86400

/**
 * Experience has no standalone landing page — it's reached via the landing
 * section (cards) and search. Visiting `/experience` directly redirects to the
 * most recent role (newest `startDate`), mirroring the portfolio index.
 */
export default async function ExperienceIndex() {
  const slug = await firstExperienceSlug({ draft: await isPreview() })
  if (!slug) notFound()
  redirect(`/experience/${slug}`)
}
