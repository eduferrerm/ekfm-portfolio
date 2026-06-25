import { notFound, redirect } from 'next/navigation'

import { landingSectionAnchor } from '@/features/landing/queries'
import { dearHref } from '@/lib/routes'

export const revalidate = 3600

type Args = {
  params: Promise<{ company: string }>
}

/** Scoped Contact shortcut — redirects to the scoped landing band anchor. */
export default async function ScopedContactRedirect({ params }: Args) {
  const { company } = await params
  const anchor = await landingSectionAnchor('contact', dearHref(company))
  if (!anchor) notFound()
  redirect(anchor)
}
