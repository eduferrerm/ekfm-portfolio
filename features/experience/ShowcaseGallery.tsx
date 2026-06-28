'use client'

import { useState } from 'react'

import { MediaImage } from '@/components/primitives/MediaImage'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import type { ShowcaseItem } from './projections'

/**
 * Showcase gallery for the experience detail header: one large active image with
 * an optional "Visit site" link, plus a thumbnail strip to switch between
 * images. Fully client-side (the active index is local UI state). Renders
 * nothing when there are no images; the thumbnail strip is hidden for a single
 * image.
 */
export function ShowcaseGallery({ items }: { items: ShowcaseItem[] }) {
  const [active, setActive] = useState(0)

  if (items.length === 0) return null

  const index = Math.min(active, items.length - 1)
  const current = items[index]

  return (
    <div className="flex gap-4">
      <figure className="relative min-w-0 flex-1 overflow-hidden rounded-xl border border-border">
        <MediaImage
          media={current.media}
          className="h-auto w-full"
          sizes="(min-width: 1024px) 60vw, 100vw"
          priority
        />
        {current.label && <figcaption className="sr-only">{current.label}</figcaption>}
        {current.url && (
          <Button asChild chevron="end" className="absolute bottom-4 right-4 shadow-lg">
            <a href={current.url} target="_blank" rel="noopener noreferrer">
              Visit site
            </a>
          </Button>
        )}
      </figure>

      {items.length > 1 && (
        <ul className="flex w-24 shrink-0 flex-col gap-3 sm:w-28">
          {items.map((item, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show image ${i + 1}${item.label ? `: ${item.label}` : ''}`}
                aria-current={i === index ? 'true' : undefined}
                className={cn(
                  'block w-full overflow-hidden rounded-lg border transition',
                  i === index
                    ? 'border-primary ring-1 ring-primary'
                    : 'border-border opacity-70 hover:opacity-100',
                )}
              >
                <MediaImage media={item.media} className="h-auto w-full" sizes="112px" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
