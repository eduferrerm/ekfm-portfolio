import { Suspense } from 'react'
import { notFound } from 'next/navigation'

import { List } from '@/components/primitives/List'
import { keywordLabels } from '@/lib/keywords'
import { getSubheaders } from '@/lib/labels'
import { AnalyticsEvent } from '@/lib/posthog/events'
import { TrackOnMount } from '@/lib/posthog/TrackOnMount'

import { GraphClient, getDiagram } from './graph'
import { KeyDecisions } from './KeyDecisions'
import { RelatedContent } from './RelatedContent'
import { portfolioBySlug } from './queries'
import { decisionViews, keyDecisionsSubtitle, relatedItems } from './projections'

/** Hardcoded blue section heading (Overview / System Design / Relevant content). */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-6 text-subheader text-label">{children}</h2>
}

/**
 * Portfolio detail render — the four-band article shared by the canonical
 * `/portfolio/[slug]` route and the visitor-scoped mirror. Bands: header, global
 * context (Overview + System Design), deep dive (Key Decisions slider), relevant
 * content. Server-rendered via the Local API (depth:1 populates scope/craft labels
 * + relatedContent docs). The single System Design diagram is resolved from the
 * repo registry by `diagramKey` and rendered through the NoSSR GraphClient.
 * notFound() on miss.
 */
export async function PortfolioDetail({ slug, scope = '' }: { slug: string; scope?: string }) {
  const [item, subheaders] = await Promise.all([portfolioBySlug(slug), getSubheaders()])

  if (!item) notFound()
  const labels = subheaders.portfolio

  const overview = (item.overview ?? [])
    .map((o) => o.text)
    .filter((text): text is string => Boolean(text))
  // scope + craft render as one combined tag row (homogeneous taxonomy).
  const tags = [...keywordLabels(item.scope), ...keywordLabels(item.craft)]
  const diagram = getDiagram(item.diagramKey)
  const decisions = decisionViews(item.keyDecisions)
  const related = relatedItems(item.relatedContent, scope)

  return (
    <article className="space-y-16">
      {/* Opening a detail = navigating to this server-rendered page; a client
          mount-emitter turns that into a single named event (scope = where from). */}
      <TrackOnMount
        event={AnalyticsEvent.PortfolioItemOpened}
        properties={{ slug, from: scope || undefined }}
      />
      <header className="space-y-5">
        <p className="text-eyebrow text-primary">{item.eyebrow}</p>
        <h1 className="text-headline">{item.title}</h1>
        {item.summary && (
          <p className="max-w-2xl text-lead text-muted-foreground">{item.summary}</p>
        )}
        {tags.length > 0 && <List variant="tag" items={tags} />}
        <hr className="border-border" />
      </header>

      <div className="grid gap-12 md:grid-cols-2">
        {overview.length > 0 && (
          <section>
            <SectionLabel>{labels.overview}</SectionLabel>
            <List variant="prose" items={overview} />
          </section>
        )}
        <section>
          <SectionLabel>{labels.systemDesign}</SectionLabel>
          {diagram && (
            <div className="h-[28rem] w-full overflow-hidden rounded-lg border border-border">
              <GraphClient nodes={diagram.nodes} edges={diagram.edges} />
            </div>
          )}
        </section>
      </div>

      {decisions.length > 0 && (
        <Suspense fallback={null}>
          <KeyDecisions
            decisions={decisions}
            subtitle={keyDecisionsSubtitle(item)}
            labels={labels}
          />
        </Suspense>
      )}

      <RelatedContent items={related} label={labels.relevantContent} />
    </article>
  )
}
