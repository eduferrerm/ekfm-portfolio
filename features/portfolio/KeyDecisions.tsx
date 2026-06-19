'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { List } from '@/components/primitives/List'
import { SliderControls } from '@/components/primitives/Slider'
import type { Subheaders } from '@/lib/labels'

import type { KeyDecisionView } from './projections'

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
  labels,
}: {
  decisions: KeyDecisionView[]
  subtitle: string
  labels: Subheaders['portfolio']
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
      <h2 className="text-3xl font-semibold tracking-tight">{labels.keyDecisions}</h2>
      <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-primary">
        {subtitle}
      </p>

      <div className="mt-6 flex flex-col gap-6">
        <div className="rounded-2xl border border-border p-6 sm:p-10">
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <h3 className="mb-4 text-xl font-semibold text-blue-500">{decision.title}</h3>
              {decision.description && (
                <p className="leading-relaxed text-foreground/80">{decision.description}</p>
              )}
            </div>

            <div>
              <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-blue-500">
                {labels.conclusion}{' '}
                <span aria-hidden>{decision.conclusion === 'up' ? '👍' : '👎'}</span>
                <span className="sr-only">
                  {decision.conclusion === 'up' ? 'Adopted' : 'Rejected'}
                </span>
              </h3>
              <List variant="prose" items={decision.points} />
            </div>
          </div>
        </div>

        <SliderControls
          index={index}
          count={decisions.length}
          onIndexChange={setIndex}
          label={labels.keyDecisions}
        />
      </div>
    </section>
  )
}
