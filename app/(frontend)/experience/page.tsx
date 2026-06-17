import { getPayload } from 'payload'
import config from '@payload-config'

import { ExperienceSection } from '@/features/experience/ExperienceSection'
import { getSubheaders } from '@/lib/labels'

// ISR: revalidated hourly.
export const revalidate = 3600

/**
 * Single inner page rendering every experience, newest first, each in a #slug
 * anchor target. Search results and the landing quick-links deep-link here via
 * /experience#slug. Data via the Local API (no HTTP hop); depth:1 populates
 * companyLogo, showcase and the scope/craft keyword labels.
 */
export default async function ExperiencePage() {
  const payload = await getPayload({ config })
  const [{ docs }, subheaders] = await Promise.all([
    payload.find({
      collection: 'experience',
      sort: '-startDate',
      limit: 1000,
      depth: 1,
    }),
    getSubheaders(),
  ])

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-16 text-3xl font-semibold tracking-tight">Experience</h1>
      <div className="space-y-24">
        {docs.map((exp) => (
          <ExperienceSection key={exp.id} exp={exp} labels={subheaders.experience} />
        ))}
      </div>
    </main>
  )
}
