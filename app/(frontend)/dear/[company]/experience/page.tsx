import { notFound, redirect } from 'next/navigation'

import { firstExperienceSlug } from '@/features/experience/queries'
import { dearHref, experienceHref } from '@/lib/routes'

export const revalidate = 86400

type Args = {
  params: Promise<{ company: string }>
}

/** Scoped experience index — redirects to the most recent role, staying in scope. */
export default async function ScopedExperienceIndex({ params }: Args) {
  const { company } = await params
  const slug = await firstExperienceSlug()
  if (!slug) notFound()
  redirect(experienceHref(slug, dearHref(company)))
}
