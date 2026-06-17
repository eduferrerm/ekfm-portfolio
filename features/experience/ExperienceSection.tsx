import type { Experience } from '@/payload-types'
import { List } from '@/components/primitives/List'
import { MediaImage } from '@/components/primitives/MediaImage'
import { MediaVideo } from '@/components/primitives/MediaVideo'
import type { Subheaders } from '@/lib/labels'

import { dateRange, keywordLabels } from './experience'

/** Hardcoded section heading (Role Description / Scope / Craft). */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
      {children}
    </h3>
  )
}

/**
 * One experience rendered as an anchored section. `id={slug}` is the target for
 * /experience#slug (from search) and the landing quick-links; `scroll-mt-24`
 * keeps the heading clear of any sticky chrome when jumped to. Sub-sections
 * render only when they have content.
 */
export function ExperienceSection({
  exp,
  labels,
}: {
  exp: Experience
  labels: Subheaders['experience']
}) {
  const logo = typeof exp.companyLogo === 'object' ? exp.companyLogo : null
  const video = typeof exp.showcase === 'object' ? exp.showcase : null
  const responsibilities = (exp.responsibilities ?? [])
    .map((r) => r.text)
    .filter((text): text is string => Boolean(text))
  const scope = keywordLabels(exp.scope)
  const craft = keywordLabels(exp.craft)

  return (
    <section id={exp.slug ?? undefined} className="scroll-mt-24">
      <header className="mb-8 flex items-center gap-4">
        {logo && <MediaImage media={logo} className="h-12 w-auto" />}
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{exp.role}</h2>
          <p className="text-muted-foreground">
            {exp.company} · {dateRange(exp)}
          </p>
        </div>
      </header>

      {video && (
        <div className="mb-10">
          <MediaVideo media={video} />
        </div>
      )}

      {responsibilities.length > 0 && (
        <div className="mb-10">
          <SectionLabel>{labels.roleDescription}</SectionLabel>
          <List variant="prose" items={responsibilities} />
        </div>
      )}

      {scope.length > 0 && (
        <div className="mb-8">
          <SectionLabel>{labels.scope}</SectionLabel>
          <List variant="tag" items={scope} />
        </div>
      )}

      {craft.length > 0 && (
        <div className="mb-8">
          <SectionLabel>{labels.craft}</SectionLabel>
          <List variant="tag" items={craft} />
        </div>
      )}
    </section>
  )
}
