import { notFound } from 'next/navigation'

import { Landing } from '@/features/landing/Landing'
import { allVisitorSlugs, visitorBySlug, visitorContentGlobal } from '@/features/visitor/queries'

// ISR daily backstop; on-demand revalidate + warmVisitor on publish, unknown
// companies fall through to the layout → docs/ARCHITECTURE.md (ROUTING).
export const revalidate = 86400

export async function generateStaticParams() {
  const companies = await allVisitorSlugs()
  return companies.map((company) => ({ company }))
}

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
