import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'

import { List } from '@/components/primitives/List'
import { CONTENT_SUBHEADERS } from '@/lib/labels'
import { keywordLabels } from '@/features/experience/experience'
import { GraphClient, getDiagram } from '@/features/portfolio/graph'
import { KeyDecisions } from '@/features/portfolio/KeyDecisions'
import { RelatedContent } from '@/features/portfolio/RelatedContent'
import { decisionViews, keyDecisionsSubtitle, relatedItems } from '@/features/portfolio/portfolio'

// ISR: revalidated hourly.
export const revalidate = 3600

type Args = {
  params: Promise<{ slug: string }>
}

/** Hardcoded blue section heading (Overview / System Design / Relevant content). */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-6 text-lg font-semibold text-blue-500">{children}</h2>
}

/**
 * Portfolio detail. Four bands — header, global context (Overview + System
 * Design), deep dive (Key Decisions slider), relevant content. Server-rendered
 * via the Local API (depth:1 populates scope/craft labels + relatedContent
 * docs). The single System Design diagram is resolved from the repo registry by
 * `diagramKey` and rendered through the NoSSR GraphClient. notFound() on miss.
 */
export default async function PortfolioItemPage({ params }: Args) {
  const { slug } = await params
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'portfolio',
    where: { slug: { equals: slug } },
    depth: 1,
    limit: 1,
  })

  const item = docs[0]
  if (!item) notFound()

  const overview = (item.overview ?? [])
    .map((o) => o.text)
    .filter((text): text is string => Boolean(text))
  // scope + craft render as one combined tag row (homogeneous taxonomy).
  const tags = [...keywordLabels(item.scope), ...keywordLabels(item.craft)]
  const diagram = getDiagram(item.diagramKey)
  const decisions = decisionViews(item.keyDecisions)
  const related = relatedItems(item.relatedContent)

  return (
    <article className="mx-auto max-w-5xl space-y-16">
      <header className="space-y-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          {item.eyebrow}
        </p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{item.title}</h1>
        {tags.length > 0 && <List variant="tag" items={tags} />}
        <hr className="border-border" />
      </header>

      <div className="grid gap-12 md:grid-cols-2">
        {overview.length > 0 && (
          <section>
            <SectionLabel>{CONTENT_SUBHEADERS.portfolio.overview}</SectionLabel>
            <List variant="prose" items={overview} />
          </section>
        )}
        <section>
          <SectionLabel>{CONTENT_SUBHEADERS.portfolio.systemDesign}</SectionLabel>
          {diagram && (
            <div className="h-[28rem] w-full overflow-hidden rounded-lg border border-border">
              <GraphClient nodes={diagram.nodes} edges={diagram.edges} />
            </div>
          )}
        </section>
      </div>

      {decisions.length > 0 && (
        <Suspense fallback={null}>
          <KeyDecisions decisions={decisions} subtitle={keyDecisionsSubtitle(item)} />
        </Suspense>
      )}

      <RelatedContent items={related} />
    </article>
  )
}
