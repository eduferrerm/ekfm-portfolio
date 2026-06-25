import { notFound, redirect } from 'next/navigation'

import { firstPortfolioSlug } from '@/features/portfolio/queries'

// ISR: daily backstop; publishes revalidate on demand (revalidateSite).
export const revalidate = 86400

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
