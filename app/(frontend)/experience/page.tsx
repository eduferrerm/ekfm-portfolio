import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'

// ISR: revalidated hourly.
export const revalidate = 3600

/**
 * Experience has no standalone landing page — it's reached via the landing
 * section (cards) and search. Visiting `/experience` directly redirects to the
 * most recent role (newest `startDate`), mirroring the portfolio index.
 */
export default async function ExperienceIndex() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'experience',
    sort: '-startDate',
    limit: 1,
    depth: 0,
  })

  const first = docs[0]
  if (!first?.slug) notFound()
  redirect(`/experience/${first.slug}`)
}
