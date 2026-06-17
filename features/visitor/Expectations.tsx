'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

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
 * site content that supports it. The active slide mirrors to `?expectation=N`
 * (1-based) so it deep-links and survives back/forward — must be rendered under
 * <Suspense> by the parent (useSearchParams). Composes the atomized
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
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (expectations.length === 0) return null

  const parsed = Number(searchParams.get('expectation'))
  const index = Number.isFinite(parsed)
    ? Math.min(Math.max(parsed - 1, 0), expectations.length - 1)
    : 0

  const setIndex = (next: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('expectation', String(next + 1))
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const view = expectations[index]

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-border p-6 sm:p-8">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500">
          <MediaImage media={logo} className="h-full w-full object-cover" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-primary">{labels.expectations}</p>
          <p className="truncate text-xs text-muted-foreground">Company: {role}</p>
        </div>
        <span className="text-xs font-semibold text-primary">
          {index + 1}/{expectations.length}
        </span>
      </div>

      <p className="text-lg leading-relaxed text-foreground/90">{view.expectation}</p>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-primary">{labels.reply}</h3>
        {/* One prose body flowed into two balanced columns — no break-inside
            guard, so any length splits to halve the height and keep the slide
            controls in view. */}
        <div className="gap-x-8 sm:columns-2 [&>p]:mb-4 [&>p:last-child]:mb-0">
          {view.replyParagraphs.map((text, i) => (
            <p key={i} className="leading-relaxed text-foreground/80">
              {text}
            </p>
          ))}
        </div>
      </div>

      {view.items.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-blue-500">{labels.relevantContent}</h3>
          <ul className="grid gap-3 sm:grid-cols-2">
            {view.items.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="group flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                    <MediaImage media={item.thumbnail} className="h-full w-full object-cover" />
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="text-xs text-muted-foreground">{item.title}</span>
                    <span className="truncate text-sm font-medium group-hover:underline">
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
        onIndexChange={setIndex}
        label={labels.expectations}
      />
    </div>
  )
}
