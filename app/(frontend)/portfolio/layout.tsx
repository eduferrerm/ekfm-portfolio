import { sectionNav } from '@/features/landing/queries'
import { portfolioNavItems } from '@/features/portfolio/queries'
import { buildSearchDataset } from '@/lib/search/dataset'

import { SectionShell } from '../_chrome/SectionShell'

/**
 * Shared layout for the portfolio section: the global SectionShell (top bar +
 * persistent aside + mobile menu) wrapping the server-rendered detail route. The
 * aside sub-nav lists every piece in display `order`; the shell is not remounted
 * across soft-navigations, giving the section its SPA feel. Section state lives
 * in the URL (e.g. ?decision=) — read it in the child routes, not here.
 */
export default async function PortfolioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sections, items, documents] = await Promise.all([
    sectionNav(),
    portfolioNavItems(),
    buildSearchDataset(),
  ])

  return (
    <SectionShell active="portfolio" sections={sections} items={items} documents={documents}>
      {children}
    </SectionShell>
  )
}
