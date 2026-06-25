import { ExperienceDetail } from '@/features/experience/ExperienceDetail'
import { allExperienceSlugs } from '@/features/experience/queries'
import { allVisitorSlugs } from '@/features/visitor/queries'

export const revalidate = 3600

export async function generateStaticParams() {
  const [companies, slugs] = await Promise.all([allVisitorSlugs(), allExperienceSlugs()])
  return companies.flatMap((company) => slugs.map((slug) => ({ company, slug })))
}

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
