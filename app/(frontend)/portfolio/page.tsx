import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'

// ISR: revalidated hourly.
export const revalidate = 3600

/**
 * Portfolio has no standalone landing page — it's reached via the landing
 * section (Phase 5) and, once inside, the aside nav (future branch). Visiting
 * `/portfolio` directly redirects to the first piece (lowest `order`).
 */
export default async function PortfolioIndex() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'portfolio',
    sort: 'order',
    limit: 1,
    depth: 0,
  })

  const first = docs[0]
  if (!first?.slug) notFound()
  redirect(`/portfolio/${first.slug}`)
}
