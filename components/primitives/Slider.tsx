'use client'

import { cn } from '@/lib/utils'

/**
 * Controlled slider/carousel primitive. Owns no state itself — the consumer
 * holds `index` (e.g. synced to a URL param) and updates it via
 * `onIndexChange`. Renders the current slide (`children`) plus Prev/Next pills
 * and a clickable dot strip. First consumer: the portfolio Key Decisions slider.
 */
type SliderProps = {
  index: number
  count: number
  onIndexChange: (index: number) => void
  children: React.ReactNode
  className?: string
  /** Accessible label for the control region (e.g. "Key decisions"). */
  label?: string
}

export function Slider({ index, count, onIndexChange, children, className, label }: SliderProps) {
  if (count === 0) return null

  const go = (i: number) => onIndexChange(Math.min(Math.max(i, 0), count - 1))

  return (
    <div className={cn('flex flex-col gap-6', className)} role="group" aria-label={label}>
      <div className="rounded-2xl border border-border p-6 sm:p-10">{children}</div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => go(index - 1)}
          disabled={index === 0}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span aria-hidden>‹</span> Prev
        </button>

        <ul className="flex items-center gap-2" aria-hidden>
          {Array.from({ length: count }, (_, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => go(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={cn(
                  'h-2.5 w-2.5 rounded-full transition',
                  i === index ? 'bg-primary' : 'bg-muted hover:bg-muted-foreground/40',
                )}
              />
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => go(index + 1)}
          disabled={index === count - 1}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next <span aria-hidden>›</span>
        </button>
      </div>
    </div>
  )
}
