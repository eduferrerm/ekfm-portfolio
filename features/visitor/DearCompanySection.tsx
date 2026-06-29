import { Suspense } from 'react'
import Link from 'next/link'

import { Container } from '@/components/Container'
import { List } from '@/components/primitives/List'
import { Button } from '@/components/ui/button'
import { DEAR_COMPANY_ID } from '@/lib/nav'
import { dearHref } from '@/lib/routes'
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
  // Scope the per-expectation relevant-content links to the visitor's mirror so
  // they stay in scope (the slider renders them as plain <Link>s, no client scoping).
  const views = expectationViews(visitor.expectations, dearHref(visitor.slug))
  const intro = (content.intro ?? []).map((i) => withHighlight(i.text, content.highlightPhrase))
  const labels: ExpectationLabels = {
    expectations: content.constants?.expectations || 'Expectations',
    reply: content.constants?.reply || 'Reply',
    relevantContent: content.constants?.relevantContent || 'Relevant content',
  }
  const jobPostLabel = content.constants?.jobPost || 'Job Post Here'

  // Anchor + spacing mirror the landing bands: `id` lives on the outermost
  // <section> with `py-20` INSIDE it, so scroll-padding-top lands the title with
  // the same offset as every other section (see features/landing/bands.tsx).
  return (
    <section id={DEAR_COMPANY_ID}>
      <Container className="py-20">
        <div className="grid gap-10 md:gap-20 lg:grid-cols-[2fr_3fr]">
          <div>
            <h2 className="text-header tracking-tight text-foreground/70">
              Dear {visitor.company}
            </h2>

            <List variant="prose" items={intro} className="mt-6" chevronColor="text-label" />

            <Button asChild variant="secondary" className="mt-8">
              <Link href={visitor.jobPostUrl} target="_blank" rel="noopener noreferrer">
                {jobPostLabel}
              </Link>
            </Button>
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
      </Container>
    </section>
  )
}
