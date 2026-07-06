import 'server-only'

import { getPayload } from 'payload'
import config from '@payload-config'

import type { Experience } from '@/payload-types'
import type { NavItem } from '@/lib/nav'
import { PUBLISHED_ONLY, publishedWhere } from '@/lib/preview'

import { experienceNavItem } from './projections'

/**
 * Experience data-access (Payload Local API, no HTTP hop). The pure view-model
 * mappers live in `./projections`; these only fetch.
 *
 * Reads are draft-aware: without `draft`, they return only published roles;
 * with `draft` (the owner previewing, see lib/preview) they return the working
 * draft. Callers read `isPreview()` in request scope and thread it in.
 */

/** All roles as aside nav sub-items, newest first (matches the aside order). */
export async function experienceNavItems(scope = '', { draft = false } = {}): Promise<NavItem[]> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'experience',
    where: publishedWhere(draft),
    draft,
    sort: '-startDate',
    limit: 1000,
    depth: 1,
    select: { role: true, company: true, slug: true, companyLogo: true },
  })
  return docs.map((d) => experienceNavItem(d, scope))
}

/** One role by slug. depth:1 populates the logo, showcase images and scope/craft labels. */
export async function experienceBySlug(
  slug: string,
  { draft = false } = {},
): Promise<Experience | null> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'experience',
    where: publishedWhere(draft, { slug: { equals: slug } }),
    draft,
    depth: 1,
    limit: 1,
  })
  return docs[0] ?? null
}

/** Slug of the most recent role (newest startDate) — the `/experience` redirect target. */
export async function firstExperienceSlug({ draft = false } = {}): Promise<string | null> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'experience',
    where: publishedWhere(draft),
    draft,
    sort: '-startDate',
    limit: 1,
    depth: 0,
  })
  return docs[0]?.slug ?? null
}

/**
 * Every published role's slug — drives `generateStaticParams` so details
 * pre-render at build. Always published-only: a draft role must never be
 * pre-rendered into the static tree (it surfaces on demand via draft mode).
 */
export async function allExperienceSlugs(): Promise<string[]> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'experience',
    where: PUBLISHED_ONLY,
    sort: '-startDate',
    limit: 1000,
    depth: 0,
    select: { slug: true },
  })
  return docs.map((d) => d.slug).filter((slug): slug is string => Boolean(slug))
}
