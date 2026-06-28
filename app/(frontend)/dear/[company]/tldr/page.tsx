import { notFound, redirect } from 'next/navigation'

import { landingSectionAnchor } from '@/features/landing/queries'
import { dearHref } from '@/lib/routes'

export const revalidate = 86400

type Args = {
  params: Promise<{ company: string }>
}

/** Scoped TL;DR shortcut — redirects to the scoped landing band anchor. */
export default async function ScopedTldrRedirect({ params }: Args) {
  const { company } = await params
  const anchor = await landingSectionAnchor('tldr', dearHref(company))
  if (!anchor) notFound()
  redirect(anchor)
}
