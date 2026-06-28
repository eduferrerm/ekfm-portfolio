import { notFound, redirect } from 'next/navigation'

import { landingSectionAnchor } from '@/features/landing/queries'
import { dearHref } from '@/lib/routes'

export const revalidate = 86400

type Args = {
  params: Promise<{ company: string }>
}

/** Scoped More-about-me shortcut — redirects to the scoped landing band anchor. */
export default async function ScopedMoreMeRedirect({ params }: Args) {
  const { company } = await params
  const anchor = await landingSectionAnchor('moreAboutMe', dearHref(company))
  if (!anchor) notFound()
  redirect(anchor)
}
