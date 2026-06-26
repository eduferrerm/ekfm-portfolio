import { cn } from '@/lib/utils'

export type ChevronDirection = 'up' | 'right' | 'down' | 'left'

/** Per-direction rotation. The base SVG points DOWN; rotate for the rest. */
const ROTATION: Record<ChevronDirection, string> = {
  down: 'rotate-0',
  left: 'rotate-90',
  up: 'rotate-180',
  right: '-rotate-90',
}

/**
 * Placeholder chevron icon. A custom icon (authored upstream, not yet in the
 * repo) will replace the inline SVG path later — keep the `{direction, color}`
 * API stable so the swap stays internal to this file.
 *
 * `color` is a Tailwind text-color utility (e.g. `text-muted-foreground`), applied
 * via `currentColor` because app code is inline-style-free; `direction` rotates the
 * glyph. The exact color chosen at call sites today is provisional.
 */
export function Chevron({
  direction = 'down',
  color = 'text-current',
  className,
}: {
  direction?: ChevronDirection
  color?: string
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn('h-6 w-6', ROTATION[direction], color, className)}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}
