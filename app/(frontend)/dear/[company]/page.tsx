import { notFound } from 'next/navigation'

import { Landing } from '@/features/landing/Landing'
import { allVisitorSlugs, visitorBySlug, visitorContentGlobal } from '@/features/visitor/queries'

// ISR: daily time-based backstop. Freshness is driven on demand — a visitor
// publish runs revalidateSite() + warmVisitor(slug) (see payload/collections/
// Visitors.ts), so the shareable landing is hot the moment it's published, even
// for a company added between deploys. generateStaticParams pre-renders every
// known company at build; unknown companies fall through to the layout's
// notFound() (dynamicParams stays true).
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
