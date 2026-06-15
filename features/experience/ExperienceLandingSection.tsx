import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'

import { dateRange } from './experience'

/**
 * Landing projection of Experience: quick-access deep-links into the
 * /experience#slug anchors, newest first. Self-contained RSC (own Local API
 * read, lean select — no keywords/media) so Phase 5's landing composition can
 * drop it in as-is. Renders nothing when there are no experiences.
 */
export async function ExperienceLandingSection() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'experience',
    sort: '-startDate',
    limit: 1000,
    depth: 0,
    select: { role: true, company: true, slug: true, startDate: true, endDate: true, current: true },
  })

  if (docs.length === 0) return null

  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <h2 className="mb-8 text-2xl font-semibold tracking-tight">Experience</h2>
      <ul className="space-y-3">
        {docs.map((exp) => (
          <li key={exp.id}>
            <Link
              href={exp.slug ? `/experience#${exp.slug}` : '/experience'}
              className="group flex flex-wrap items-baseline gap-x-3 gap-y-1"
            >
              <span className="font-medium underline-offset-4 group-hover:underline">
                {exp.role}
              </span>
              <span className="text-sm text-muted-foreground">
                {exp.company} · {dateRange(exp)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
