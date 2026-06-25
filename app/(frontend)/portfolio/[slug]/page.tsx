import { PortfolioDetail } from '@/features/portfolio/PortfolioDetail'
import { allPortfolioSlugs } from '@/features/portfolio/queries'

// ISR: revalidated hourly. generateStaticParams pre-renders every piece at build
// so there are no cold first hits; slugs added later render on-demand (then cache).
export const revalidate = 3600

export async function generateStaticParams() {
  const slugs = await allPortfolioSlugs()
  return slugs.map((slug) => ({ slug }))
}

type Args = {
  params: Promise<{ slug: string }>
}

export default async function PortfolioItemPage({ params }: Args) {
  const { slug } = await params
  return <PortfolioDetail slug={slug} />
}
