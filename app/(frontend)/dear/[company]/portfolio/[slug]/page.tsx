import { PortfolioDetail } from '@/features/portfolio/PortfolioDetail'
import { allPortfolioSlugs } from '@/features/portfolio/queries'
import { allVisitorSlugs } from '@/features/visitor/queries'
import { dearHref } from '@/lib/routes'

export const revalidate = 86400

export async function generateStaticParams() {
  const [companies, slugs] = await Promise.all([allVisitorSlugs(), allPortfolioSlugs()])
  return companies.flatMap((company) => slugs.map((slug) => ({ company, slug })))
}

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
