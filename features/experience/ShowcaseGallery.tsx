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
    <div className="flex gap-4 mb-20 flex-col md:flex-row">
      {/* Fixed capture ratio (the 1000×549 showcase spec) so swapping images
          never reflows the box — source images drift a couple of px and `h-auto`
          would track each one. The image fills the ratio box with object-cover;
          aspect-ratio keeps it responsive. */}
      <figure className="relative aspect-[1000/549] min-w-0 flex-1 max-w-205.5 overflow-hidden rounded-xl border border-border">
        <MediaImage
          key={index}
          media={current.media}
          className="absolute inset-0 h-full w-full object-cover animate-showcase-zoom"
          sizes="(min-width: 1024px) 60vw, 100vw"
          priority
        />
        {current.url && (
          <Button asChild chevron="end" className="absolute bottom-4 right-4 shadow-lg">
            <a href={current.url} target="_blank" rel="noopener noreferrer">
              {current.linkLabel || 'Visit site'}
            </a>
          </Button>
        )}
      </figure>

      {items.length > 1 && (
        <ul className="flex w-full shrink-0 gap-3 flex-row md:w-31.5 md:flex-col">
          {items.map((item, i) => (
            <li key={i} className="flex-1 md:flex-none">
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show image ${i + 1}`}
                aria-current={i === index ? 'true' : undefined}
                className={cn(
                  'relative block aspect-[1000/549] w-full overflow-hidden rounded-lg border transition',
                  i === index
                    ? 'border-primary ring-1 ring-primary'
                    : 'border-border hover:border-muted-foreground',
                )}
              >
                <MediaImage
                  media={item.media}
                  className="absolute inset-0 h-full w-full object-cover"
                  sizes="(min-width: 768px) 126px, 33vw"
                />
                {/* Dim the active thumbnail's IMAGE only (not its selection
                    border/ring, which sit outside this inset veil): a
                    background-coloured overlay that fades to 70% on selection. It
                    reads as "this one is already enlarged beside the strip". 1s
                    fade on the same easing as the showcase zoom. */}
                <span
                  aria-hidden
                  className={cn(
                    'pointer-events-none absolute inset-0 bg-background transition-opacity duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]',
                    i === index ? 'opacity-70' : 'opacity-0',
                  )}
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
