import { ExperienceDetail } from '@/features/experience/ExperienceDetail'

export const revalidate = 3600

type Args = {
  params: Promise<{ company: string; slug: string }>
}

/**
 * Visitor-scoped experience detail — the same view as the canonical route. The
 * detail body has no internal links of its own; the scoped chrome (nav + palette)
 * comes from the section layout.
 */
export default async function ScopedExperienceItem({ params }: Args) {
  const { slug } = await params
  return <ExperienceDetail slug={slug} />
}
