import { Suspense } from 'react'
import { notFound } from 'next/navigation'

import { List } from '@/components/primitives/List'
import { MediaImage } from '@/components/primitives/MediaImage'
import { keywordLabels } from '@/lib/keywords'
import { yearRange } from '@/lib/format'
import { getSubheaders } from '@/lib/labels'

import { DeepDive } from './DeepDive'
import { ShowcaseGallery } from './ShowcaseGallery'
import { experienceBySlug } from './queries'
import { deepDiveViews, showcaseItems } from './projections'

/** Hardcoded column heading (Responsibilities / Scope / Craft). */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
      {children}
    </h3>
  )
}

/**
 * Experience detail render — one role, shared by the canonical
 * `/experience/[slug]` route and the visitor-scoped mirror. Mirrors the portfolio
 * detail UX. Bands: header (logo + company + years + role), showcase gallery, the
 * Responsibilities / Scope / Craft columns, and the Deep Dive slider.
 * Server-rendered via the Local API (depth:1 populates the logo, showcase images
 * and the scope/craft keyword labels). notFound() on miss.
 */
export async function ExperienceDetail({ slug }: { slug: string }) {
  const [exp, subheaders] = await Promise.all([experienceBySlug(slug), getSubheaders()])

  if (!exp) notFound()
  const labels = subheaders.experience

  const logo = typeof exp.companyLogo === 'object' ? exp.companyLogo : null
  const gallery = showcaseItems(exp.showcase)
  const responsibilities = (exp.responsibilities ?? [])
    .map((r) => r.text)
    .filter((text): text is string => Boolean(text))
  const scope = keywordLabels(exp.scope)
  const craft = keywordLabels(exp.craft)
  const dives = deepDiveViews(exp.deepDive)

  return (
    <article className="space-y-16">
      <header className="space-y-5">
        <div className="flex items-center gap-3">
          {logo && <MediaImage media={logo} className="h-10 w-auto" />}
          <div>
            <p className="font-semibold">{exp.company}</p>
            <p className="text-sm text-muted-foreground">{yearRange(exp)}</p>
          </div>
        </div>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{exp.role}</h1>
      </header>

      {gallery.length > 0 && <ShowcaseGallery items={gallery} />}

      <div className="grid gap-10 md:grid-cols-3">
        {responsibilities.length > 0 && (
          <section>
            <SectionLabel>{labels.roleDescription}</SectionLabel>
            <List variant="prose" items={responsibilities} />
          </section>
        )}
        {scope.length > 0 && (
          <section>
            <SectionLabel>{labels.scope}</SectionLabel>
            <ul className="space-y-3">
              {scope.map((s, i) => (
                <li key={i} className="leading-relaxed text-foreground/90">
                  {s}
                </li>
              ))}
            </ul>
          </section>
        )}
        {craft.length > 0 && (
          <section>
            <SectionLabel>{labels.craft}</SectionLabel>
            <List variant="tag" items={craft} />
          </section>
        )}
      </div>

      {dives.length > 0 && (
        <Suspense fallback={null}>
          <DeepDive
            items={dives}
            heading={labels.deepDive}
            eyebrow={`${exp.role} at ${exp.company}`}
          />
        </Suspense>
      )}
    </article>
  )
}
