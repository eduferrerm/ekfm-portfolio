import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { visitorBySlug } from '@/features/visitor/queries'

// The mirror is personalized for one targeted company — never index it (don't
// leak the targeted-company list to search engines). Applies to the whole subtree.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

type Args = {
  params: Promise<{ company: string }>
  children: React.ReactNode
}

/**
 * Guard + scope root for the visitor mirror (`/dear/[company]/...`). Validates the
 * company once for the entire subtree — an unknown company 404s before any scoped
 * page renders, so non-visitors can't browse a half-personalized site. The visitor
 * fetch is React.cache()-deduped, so the landing + section layouts that also read
 * it share this one query.
 */
export default async function DearLayout({ params, children }: Args) {
  const { company } = await params
  const visitor = await visitorBySlug(company)
  if (!visitor) notFound()
  return <>{children}</>
}
