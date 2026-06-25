import { notFound } from 'next/navigation'

import { sectionNav } from '@/features/landing/queries'
import { portfolioNavItems } from '@/features/portfolio/queries'
import { buildVisitorSearchContext } from '@/features/search-palette/visitorContext'
import { visitorBySlug } from '@/features/visitor/queries'
import { dearHref } from '@/lib/routes'
import { buildSearchDataset } from '@/lib/search/dataset'

import { SectionShell } from '../../../_chrome/SectionShell'

/**
 * Visitor-scoped portfolio chrome — mirrors the canonical portfolio layout but
 * scopes every nav href to `/dear/[company]` and feeds the search palette the
 * visitor's personalized context, so the visitor experience persists across the
 * whole scoped section, not just the landing.
 */
export default async function ScopedPortfolioLayout({
  params,
  children,
}: {
  params: Promise<{ company: string }>
  children: React.ReactNode
}) {
  const { company } = await params
  const scope = dearHref(company)
  const [visitor, sections, items, documents] = await Promise.all([
    visitorBySlug(company),
    sectionNav(scope),
    portfolioNavItems(scope),
    buildSearchDataset(),
  ])
  if (!visitor) notFound()
  const home = { label: `Dear ${visitor.company}`, href: scope }

  return (
    <SectionShell
      active="portfolio"
      sections={sections}
      items={items}
      documents={documents}
      visitorSearch={buildVisitorSearchContext(visitor)}
      home={home}
    >
      {children}
    </SectionShell>
  )
}
