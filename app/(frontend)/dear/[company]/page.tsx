import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'

import { DearCompanySection } from '@/features/visitor/DearCompanySection'
import { WelcomeBanner } from '@/features/visitor/WelcomeBanner'

// ISR: per-company pages are generated on-demand and revalidated hourly. No
// generateStaticParams — unknown companies 404 and known ones build on first
// hit (and revalidate via the Visitors afterChange hook).
export const revalidate = 3600

type Args = {
  params: Promise<{ company: string }>
}

export default async function VisitorPage({ params }: Args) {
  const { company } = await params
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'visitors',
    where: { slug: { equals: company } },
    // depth:2 populates the avatar + each expectation's relevantContent docs and
    // their thumbnails (one level past the related doc) for the cards.
    depth: 2,
    limit: 1,
  })

  const visitor = docs[0]
  if (!visitor) notFound()

  const content = await payload.findGlobal({ slug: 'visitor-content' })

  return (
    <main className="mx-auto max-w-5xl space-y-12 px-6 py-10">
      <WelcomeBanner
        company={visitor.company}
        logo={visitor.companyLogo}
        greeting={content.welcomeGreeting}
      />
      <DearCompanySection visitor={visitor} content={content} />
    </main>
  )
}
