import 'server-only'

import { getPayload } from 'payload'
import config from '@payload-config'

import type { Experience } from '@/payload-types'
import type { NavItem } from '@/lib/nav'

import { experienceNavItem } from './projections'

/**
 * Experience data-access (Payload Local API, no HTTP hop). The pure view-model
 * mappers live in `./projections`; these only fetch.
 */

/** All roles as aside nav sub-items, newest first (matches the aside order). */
export async function experienceNavItems(): Promise<NavItem[]> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'experience',
    sort: '-startDate',
    limit: 1000,
    depth: 1,
    select: { role: true, company: true, slug: true, companyLogo: true },
  })
  return docs.map(experienceNavItem)
}

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
