import { cn } from '@/lib/utils'

export type ChevronDirection = 'up' | 'right' | 'down' | 'left'

/** Per-direction rotation. The base glyph points RIGHT; rotate for the rest. */
const ROTATION: Record<ChevronDirection, string> = {
  right: 'rotate-0',
  down: 'rotate-90',
  left: 'rotate-180',
  up: '-rotate-90',
}

/**
 * The EKFM arrow glyph — a blocky chevron used as a directional cue (e.g. the
 * hero scroll hint). `direction` rotates it (the artwork natively points RIGHT);
 * `color` is a Tailwind text-color utility (e.g. `text-muted-foreground`) applied
 * via `currentColor` because app code is inline-style-free, so the icon recolors
 * by prop rather than being baked into the SVG.
 *
 * Fill-based and non-square (13×20 viewBox), so it sizes by height with auto
 * width to preserve its aspect ratio; pass `className` to override.
 */
export function Chevron({
  direction = 'right',
  color = 'text-current',
  className,
}: {
  direction?: ChevronDirection
  color?: string
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 13 20"
      fill="none"
      aria-hidden="true"
      className={cn('h-5 w-auto', ROTATION[direction], color, className)}
    >
      <path
        d="M4.00684 20L1.74846e-06 20L1.57331e-06 15.9932L4.00684 15.9932L4.00684 20ZM8.01367 15.9932L4.00684 15.9932L4.00684 11.9863L8.01367 11.9863L8.01367 15.9932ZM8.01367 4.00684L8.01367 7.97949L12.0205 7.97949L12.0205 11.9863L8.01367 11.9863L8.01367 8.01367L4.00684 8.01367L4.00684 4.00684L8.01367 4.00684ZM4.00684 4.00684L1.04937e-06 4.00684L8.74228e-07 5.25411e-07L4.00684 3.50267e-07L4.00684 4.00684Z"
        fill="currentColor"
      />
    </svg>
  )
}
