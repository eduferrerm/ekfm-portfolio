import { notFound } from 'next/navigation'

import { Landing } from '@/features/landing/Landing'
import { visitorBySlug, visitorContentGlobal } from '@/features/visitor/queries'

// ISR: per-company pages are generated on-demand and revalidated hourly. No
// generateStaticParams — unknown companies 404 and known ones build on first
// hit (and revalidate via the Visitors afterChange hook).
export const revalidate = 3600

type Args = {
  params: Promise<{ company: string }>
}

/**
 * Personalized landing for a company. Renders the same assembled Landing as `/`
 * but visitor-aware: the welcome banner + Dear Company band weave into the full
 * page. No content is duplicated — one shared Landing RSC, one SSOT.
 */
export default async function VisitorPage({ params }: Args) {
  const { company } = await params

  const visitor = await visitorBySlug(company)
  if (!visitor) notFound()

  const visitorContent = await visitorContentGlobal()

  return <Landing visitor={visitor} visitorContent={visitorContent} />
}
