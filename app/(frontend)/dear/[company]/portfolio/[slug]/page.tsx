import { PortfolioDetail } from '@/features/portfolio/PortfolioDetail'
import { dearHref } from '@/lib/routes'

export const revalidate = 3600

type Args = {
  params: Promise<{ company: string; slug: string }>
}

/**
 * Visitor-scoped portfolio detail — the same view as the canonical route, with its
 * internal links (relevant content) scoped to `/dear/[company]`.
 */
export default async function ScopedPortfolioItem({ params }: Args) {
  const { company, slug } = await params
  return <PortfolioDetail slug={slug} scope={dearHref(company)} />
}
