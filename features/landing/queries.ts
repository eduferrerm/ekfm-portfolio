import 'server-only'

import { getPayload } from 'payload'
import config from '@payload-config'

import type { Landing } from '@/payload-types'
import { experienceYears, formatYearsLabel } from '@/lib/yoe'

import { experienceCard, portfolioCard, type LandingCardData } from './projections'

/**
 * Landing data-access (Payload Local API, no HTTP hop). Each query fetches lean
 * via `select` then hands the docs to the pure mappers in `./projections`.
 */

/** The Landing global. depth:1 populates hero.craft labels + sections[].searchKeywords. */
export async function landingGlobal(): Promise<Landing> {
  const payload = await getPayload({ config })
  return payload.findGlobal({ slug: 'landing', depth: 1 })
}

/** Portfolio landing cards, in display `order` (ascending). depth:1 populates the
 * scope/craft labels + the thumbnail; `select` keeps the read lean. */
export async function portfolioCards(): Promise<LandingCardData[]> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'portfolio',
    sort: 'order',
    limit: 1000,
    depth: 1,
    select: { eyebrow: true, title: true, slug: true, thumbnail: true, scope: true, craft: true },
  })
  return docs.map(portfolioCard)
}

/** Experience landing cards, newest first. */
export async function experienceCards(): Promise<LandingCardData[]> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'experience',
    sort: '-startDate',
    limit: 1000,
    depth: 1,
    select: { role: true, company: true, slug: true, companyLogo: true, scope: true, craft: true },
  })
  return docs.map(experienceCard)
}

/**
 * Formatted years-of-experience label (e.g. "8+ years") for the TL;DR band,
 * computed as a union of role date intervals so overlapping roles count once.
 * Returns '' when there are no datable roles. Evaluated at ISR regeneration via
 * `new Date()` — granularity (whole years) makes hourly recompute ample.
 */
export async function experienceYearsLabel(): Promise<string> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'experience',
    limit: 1000,
    depth: 0,
    select: { startDate: true, endDate: true, current: true },
  })
  return formatYearsLabel(experienceYears(docs, new Date()))
}
