import 'server-only'

import { getPayload } from 'payload'
import config from '@payload-config'

import type { Portfolio } from '@/payload-types'

/**
 * Portfolio data-access (Payload Local API, no HTTP hop). The pure view-model
 * mappers live in `./projections`; these only fetch.
 */

/** One piece by slug. depth:1 populates scope/craft labels + relatedContent docs. */
export async function portfolioBySlug(slug: string): Promise<Portfolio | null> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'portfolio',
    where: { slug: { equals: slug } },
    depth: 1,
    limit: 1,
  })
  return docs[0] ?? null
}

/** Slug of the first piece (lowest `order`) — the `/portfolio` redirect target. */
export async function firstPortfolioSlug(): Promise<string | null> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'portfolio',
    sort: 'order',
    limit: 1,
    depth: 0,
  })
  return docs[0]?.slug ?? null
}
