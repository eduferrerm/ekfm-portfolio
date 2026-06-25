import { ExperienceDetail } from '@/features/experience/ExperienceDetail'
import { allExperienceSlugs } from '@/features/experience/queries'

// ISR: daily backstop (publishes revalidate on demand via revalidateSite).
// generateStaticParams pre-renders every role at build so there are no cold
// first hits; slugs added later render on-demand (then cache).
export const revalidate = 86400

export async function generateStaticParams() {
  const slugs = await allExperienceSlugs()
  return slugs.map((slug) => ({ slug }))
}

type Args = {
  params: Promise<{ slug: string }>
}

export default async function ExperienceItemPage({ params }: Args) {
  const { slug } = await params
  return <ExperienceDetail slug={slug} />
}
