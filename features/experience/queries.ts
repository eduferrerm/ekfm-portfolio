import 'server-only'

import { getPayload } from 'payload'
import config from '@payload-config'

import type { Experience } from '@/payload-types'

/**
 * Experience data-access (Payload Local API, no HTTP hop). The pure view-model
 * mappers live in `./projections`; these only fetch.
 */

/** One role by slug. depth:1 populates the logo, showcase images and scope/craft labels. */
export async function experienceBySlug(slug: string): Promise<Experience | null> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'experience',
    where: { slug: { equals: slug } },
    depth: 1,
    limit: 1,
  })
  return docs[0] ?? null
}

/** Slug of the most recent role (newest startDate) — the `/experience` redirect target. */
export async function firstExperienceSlug(): Promise<string | null> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'experience',
    sort: '-startDate',
    limit: 1,
    depth: 0,
  })
  return docs[0]?.slug ?? null
}
