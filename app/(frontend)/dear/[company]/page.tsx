import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'

import { Landing } from '@/features/landing/Landing'

// ISR: per-company pages are generated on-demand and revalidated hourly. No
// generateStaticParams — unknown companies 404 and known ones build on first
// hit (and revalidate via the Visitors afterChange hook).
export const revalidate = 3600

type Args = {
  params: Promise<{ company: string }>
}

/**
 * Personalized landing for a company. Renders the same assembled Landing as `/`
 * but visitor-aware: the welcome banner + Dear Company band weave into the full
 * page. No content is duplicated — one shared Landing RSC, one SSOT.
 */
export default async function VisitorPage({ params }: Args) {
  const { company } = await params
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'visitors',
    where: { slug: { equals: company } },
    // depth:2 populates the avatar + each expectation's relevantContent docs and
    // their thumbnails (one level past the related doc) for the cards.
    depth: 2,
    limit: 1,
  })

  const visitor = docs[0]
  if (!visitor) notFound()

  const visitorContent = await payload.findGlobal({ slug: 'visitor-content' })

  return <Landing visitor={visitor} visitorContent={visitorContent} />
}
