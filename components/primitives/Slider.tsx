'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * Atomized slider navigation control: Prev / clickable dot-strip / Next, and
 * nothing else. Fully controlled — the consumer owns `index` (e.g. synced to a
 * URL param) and updates it via `onIndexChange` — and renders no slide
 * container, so each consumer composes its own surface around it (a bordered
 * panel for portfolio Key Decisions, a card for visitor Expectations). Renders
 * nothing when there is at most one slide.
 */
type SliderControlsProps = {
  index: number
  count: number
  onIndexChange: (index: number) => void
  className?: string
  /** Accessible label for the control group (e.g. "Key decisions"). */
  label?: string
}

export function SliderControls({
  index,
  count,
  onIndexChange,
  className,
  label,
}: SliderControlsProps) {
  if (count <= 1) return null

  const go = (i: number) => onIndexChange(Math.min(Math.max(i, 0), count - 1))

  return (
    <div
      className={cn('flex items-center justify-between', className)}
      role="group"
      aria-label={label}
    >
      <Button
        type="button"
        onClick={() => go(index - 1)}
        disabled={index === 0}
        className="disabled:cursor-not-allowed"
      >
        <span aria-hidden>‹</span> Prev
      </Button>

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

      <Button
        type="button"
        onClick={() => go(index + 1)}
        disabled={index === count - 1}
        className="disabled:cursor-not-allowed"
      >
        Next <span aria-hidden>›</span>
      </Button>
    </div>
  )
}
