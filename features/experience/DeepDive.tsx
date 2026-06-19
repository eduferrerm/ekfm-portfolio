'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { List } from '@/components/primitives/List'
import { SliderControls } from '@/components/primitives/Slider'

import type { DeepDiveView } from './projections'

/**
 * Deep Dive slider — experience's analogue of the portfolio Key Decisions slider.
 * The hardcoded heading + eyebrow ("{role} at {company}") stay fixed; only the
 * slide content changes as you cycle the N entries. The active slide is mirrored
 * to `?dive=N` (1-based) so it deep-links and survives back/forward. Each slide:
 * the titled narrative (left) + its Details list (right).
 */
export function DeepDive({
  items,
  heading,
  eyebrow,
}: {
  items: DeepDiveView[]
  heading: string
  eyebrow: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (items.length === 0) return null

  const parsed = Number(searchParams.get('dive'))
  const index = Number.isFinite(parsed)
    ? Math.min(Math.max(parsed - 1, 0), items.length - 1)
    : 0

  const setIndex = (next: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('dive', String(next + 1))
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const entry = items[index]

  return (
    <section className="scroll-mt-24">
      <h2 className="text-3xl font-semibold tracking-tight">{heading}</h2>
      <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-primary">
        {eyebrow}
      </p>

      <div className="mt-6 flex flex-col gap-6">
        <div className="rounded-2xl border border-border p-6 sm:p-10">
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <h3 className="mb-4 text-xl font-semibold text-blue-500">{entry.title}</h3>
              {entry.description && (
                <p className="leading-relaxed text-foreground/80">{entry.description}</p>
              )}
            </div>
            <div>
              <h3 className="mb-4 text-xl font-semibold text-blue-500">Details</h3>
              <List variant="prose" items={entry.details} />
            </div>
          </div>
        </div>

        <SliderControls
          index={index}
          count={items.length}
          onIndexChange={setIndex}
          label={heading}
        />
      </div>
    </section>
  )
}
