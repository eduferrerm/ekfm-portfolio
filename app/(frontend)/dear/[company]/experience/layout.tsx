import { notFound } from 'next/navigation'

import { experienceNavItems } from '@/features/experience/queries'
import { sectionNav } from '@/features/landing/queries'
import { buildVisitorSearchContext } from '@/features/search-palette/visitorContext'
import { visitorBySlug } from '@/features/visitor/queries'
import { dearHref } from '@/lib/routes'
import { buildSearchDataset } from '@/lib/search/dataset'

import { SectionShell } from '../../../_chrome/SectionShell'

/**
 * Visitor-scoped experience chrome — mirrors the canonical experience layout but
 * scopes every nav href to `/dear/[company]` and feeds the palette the visitor's
 * personalized context, so the visitor experience persists across the section.
 */
export default async function ScopedExperienceLayout({
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
    experienceNavItems(scope),
    buildSearchDataset(),
  ])
  if (!visitor) notFound()
  const home = { label: `Dear ${visitor.company}`, href: scope }

  return (
    <SectionShell
      active="experience"
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
