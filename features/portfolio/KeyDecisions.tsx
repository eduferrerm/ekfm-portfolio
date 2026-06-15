'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { List } from '@/components/primitives/List'
import { Slider } from '@/components/primitives/Slider'
import { CONTENT_SUBHEADERS } from '@/lib/labels'

import type { KeyDecisionView } from './portfolio'

/**
 * Deep-dive Key Decisions slider. The hardcoded "Key Decisions" heading and the
 * persistent `subtitle` stay fixed; only the slide content changes as you cycle
 * the N decisions/approaches. The active slide is mirrored to `?decision=N`
 * (1-based) so it deep-links and survives back/forward. Each slide: the decision
 * (left), and its thumb up/down conclusion + reasoning (right).
 */
export function KeyDecisions({
  decisions,
  subtitle,
}: {
  decisions: KeyDecisionView[]
  subtitle: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (decisions.length === 0) return null

  const parsed = Number(searchParams.get('decision'))
  const index = Number.isFinite(parsed)
    ? Math.min(Math.max(parsed - 1, 0), decisions.length - 1)
    : 0

  const setIndex = (next: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('decision', String(next + 1))
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const decision = decisions[index]

  return (
    <section className="scroll-mt-24">
      <h2 className="text-3xl font-semibold tracking-tight">
        {CONTENT_SUBHEADERS.portfolio.keyDecisions}
      </h2>
      <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-primary">
        {subtitle}
      </p>

      <Slider
        index={index}
        count={decisions.length}
        onIndexChange={setIndex}
        label={CONTENT_SUBHEADERS.portfolio.keyDecisions}
        className="mt-6"
      >
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h3 className="mb-4 text-xl font-semibold text-blue-500">{decision.title}</h3>
            {decision.description && (
              <p className="leading-relaxed text-foreground/80">{decision.description}</p>
            )}
          </div>

          <div>
            <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-blue-500">
              {CONTENT_SUBHEADERS.portfolio.conclusion}{' '}
              <span aria-hidden>{decision.conclusion === 'up' ? '👍' : '👎'}</span>
              <span className="sr-only">
                {decision.conclusion === 'up' ? 'Adopted' : 'Rejected'}
              </span>
            </h3>
            <List variant="prose" items={decision.points} />
          </div>
        </div>
      </Slider>
    </section>
  )
}
