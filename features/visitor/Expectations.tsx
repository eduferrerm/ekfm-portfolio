'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

import { MediaImage } from '@/components/primitives/MediaImage'
import { SliderControls } from '@/components/primitives/Slider'
import type { Media } from '@/payload-types'

import type { ExpectationView } from './visitor'

export type ExpectationLabels = {
  expectations: string
  reply: string
  relevantContent: string
}

/**
 * The Dear Company cover-letter slider. Each slide pairs one candidate
 * expectation with a reply (prose flowed into two balanced columns) and the
 * site content that supports it. The active slide is client state (instant, no
 * RSC round-trip) seeded from `?expectation=N` (1-based) and mirrored back to the
 * URL via the History API so it stays deep-linkable. Reads searchParams on mount,
 * so the parent must render it under <Suspense>. Composes the atomized
 * SliderControls inside the card surface.
 */
export function Expectations({
  expectations,
  role,
  logo,
  labels,
}: {
  expectations: ExpectationView[]
  role: string
  logo?: Media | number | null
  labels: ExpectationLabels
}) {
  const searchParams = useSearchParams()

  // Active slide is client state so changing slides is instant — no RSC
  // round-trip. Seed once from ?expectation=N (1-based), clamped to range.
  const [index, setIndex] = useState(() => {
    const parsed = Number(searchParams.get('expectation'))
    if (!Number.isFinite(parsed)) return 0
    return Math.min(Math.max(parsed - 1, 0), Math.max(expectations.length - 1, 0))
  })

  if (expectations.length === 0) return null

  const goToIndex = (next: number) => {
    setIndex(next)
    // Mirror to the URL for deep-linking via the History API — updates the
    // address bar without the server round-trip that router.replace incurs.
    const params = new URLSearchParams(window.location.search)
    params.set('expectation', String(next + 1))
    window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`)
  }

  const view = expectations[index]

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-border p-6 sm:p-8">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500">
          <MediaImage media={logo} className="h-full w-full object-cover" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-ui-bold text-primary">{labels.expectations}</p>
          <p className="truncate text-meta text-muted-foreground">{role}</p>
        </div>
        <span className="text-meta-bold text-primary">
          {index + 1}/{expectations.length}
        </span>
      </div>

      <p className="text-lead text-foreground/90">{view.expectation}</p>

      <div>
        <h3 className="mb-3 text-subheader text-label">{labels.reply}</h3>
        {/* One prose body flowed into two balanced columns — no break-inside
            guard, so any length splits to halve the height and keep the slide
            controls in view. */}
        <div className="gap-x-8 sm:columns-2 [&>p]:mb-4 [&>p:last-child]:mb-0">
          {view.replyParagraphs.map((text, i) => (
            <p key={i} className="text-body text-foreground/80">
              {text}
            </p>
          ))}
        </div>
      </div>

      {view.items.length > 0 && (
        <div>
          <h3 className="mb-3 text-subheader text-label">{labels.relevantContent}</h3>
          <ul className="grid gap-3 sm:grid-cols-2">
            {view.items.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="group flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                    <MediaImage media={item.thumbnail} className="h-full w-full object-cover" />
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="text-meta text-muted-foreground">{item.title}</span>
                    <span className="truncate text-ui-bold group-hover:underline">
                      {item.metadata}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <SliderControls
        index={index}
        count={expectations.length}
        onIndexChange={goToIndex}
        label={labels.expectations}
      />
    </div>
  )
}
