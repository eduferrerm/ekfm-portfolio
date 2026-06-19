import { notFound, redirect } from 'next/navigation'

import { firstPortfolioSlug } from '@/features/portfolio/queries'

// ISR: revalidated hourly.
export const revalidate = 3600

/**
 * Portfolio has no standalone landing page — it's reached via the landing
 * section and search. Visiting `/portfolio` directly redirects to the first
 * piece (lowest `order`).
 */
export default async function PortfolioIndex() {
  const slug = await firstPortfolioSlug()
  if (!slug) notFound()
  redirect(`/portfolio/${slug}`)
}
