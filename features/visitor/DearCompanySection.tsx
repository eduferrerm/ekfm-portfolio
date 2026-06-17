import { Suspense } from 'react'
import Link from 'next/link'

import { List } from '@/components/primitives/List'
import type { Visitor, VisitorContent } from '@/payload-types'

import { Expectations, type ExpectationLabels } from './Expectations'
import { expectationViews } from './visitor'

/** Wrap the first case-insensitive occurrence of `phrase` in a highlighted span. */
function withHighlight(text: string, phrase?: string | null) {
  if (!phrase) return text
  const at = text.toLowerCase().indexOf(phrase.toLowerCase())
  if (at === -1) return text
  return (
    <>
      {text.slice(0, at)}
      <span className="rounded bg-primary/20 px-1 text-foreground">
        {text.slice(at, at + phrase.length)}
      </span>
      {text.slice(at + phrase.length)}
    </>
  )
}

/**
 * The personalized "Dear Company" cover-letter section: an intro (left) that
 * frames how the candidate contrasts against the role's expectations, a link to
 * the source job post, and the Expectations slider (right) carrying the
 * per-expectation replies + supporting content. Reusable RSC — Phase 5 slots
 * this into the assembled landing; here it is mounted standalone on
 * /dear/[company].
 */
export function DearCompanySection({
  visitor,
  content,
}: {
  visitor: Visitor
  content: VisitorContent
}) {
  const views = expectationViews(visitor.expectations)
  const intro = (content.intro ?? []).map((i) => withHighlight(i.text, content.highlightPhrase))
  const labels: ExpectationLabels = {
    expectations: content.constants?.expectations || 'Expectations',
    reply: content.constants?.reply || 'Reply',
    relevantContent: content.constants?.relevantContent || 'Relevant content',
  }
  const jobPostLabel = content.constants?.jobPost || 'Job Post Here'

  return (
    <section id="dear-company" className="scroll-mt-24">
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground/70">
            Dear {visitor.company}
          </h2>

          <List variant="prose" items={intro} className="mt-6" />

          <Link
            href={visitor.jobPostUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
          >
            {jobPostLabel}
          </Link>
        </div>

        <Suspense fallback={null}>
          <Expectations
            expectations={views}
            role={visitor.role}
            logo={visitor.companyLogo}
            labels={labels}
          />
        </Suspense>
      </div>
    </section>
  )
}
