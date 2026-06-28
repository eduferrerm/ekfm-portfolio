import { notFound, redirect } from 'next/navigation'

import { firstPortfolioSlug } from '@/features/portfolio/queries'
import { dearHref, portfolioHref } from '@/lib/routes'

export const revalidate = 86400

type Args = {
  params: Promise<{ company: string }>
}

/** Scoped portfolio index — redirects to the first piece, staying in scope. */
export default async function ScopedPortfolioIndex({ params }: Args) {
  const { company } = await params
  const slug = await firstPortfolioSlug()
  if (!slug) notFound()
  redirect(portfolioHref(slug, dearHref(company)))
}
