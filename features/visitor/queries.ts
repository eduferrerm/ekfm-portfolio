import 'server-only'

import { getPayload } from 'payload'
import config from '@payload-config'

import type { Visitor, VisitorContent } from '@/payload-types'

/**
 * Visitor data-access (Payload Local API, no HTTP hop). The pure view-model
 * mappers live in `./visitor`; these only fetch.
 */

/**
 * One visitor by company slug. depth:2 populates the avatar + each expectation's
 * relevantContent docs and their thumbnails (one level past the related doc).
 */
export async function visitorBySlug(slug: string): Promise<Visitor | null> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'visitors',
    where: { slug: { equals: slug } },
    depth: 2,
    limit: 1,
  })
  return docs[0] ?? null
}

/** The VisitorContent global — fixed visitor-route copy (depth:0, ISR-cached). */
export async function visitorContentGlobal(): Promise<VisitorContent> {
  const payload = await getPayload({ config })
  return payload.findGlobal({ slug: 'visitor-content' })
}
