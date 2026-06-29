import { Slot, Slottable } from '@radix-ui/react-slot'

import { cn } from '@/lib/utils'

/**
 * The pressable *mechanism* — the flexible abstraction under every button-shaped
 * control, with zero brand policy. It owns only what every pressable shares: the
 * icon ↔ label layout, the global focus channel (fuchsia `ring-ring`), the
 * disabled treatment, and `asChild` (Radix Slot) so the control can render as a
 * `<Link>`/`<a>`.
 *
 * It deliberately knows nothing about emphasis tiers, the pill skin, or chevron
 * policy — those live in the design-system layer (`Button`'s `buttonVariants`).
 * That split is what lets a one-off (the search trigger) be built straight from
 * this primitive + a shared skin, without registering a `variant` it would be the
 * only member of. Pass the skin in via `className` (e.g. `buttonVariants({…})`).
 */
const pressableBase =
  'group/btn inline-flex items-center justify-center gap-3 whitespace-nowrap transition outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:opacity-40'

export type PressableProps = React.ComponentProps<'button'> & {
  /** Render the child element (e.g. `<Link>`/`<a>`) with the pressable styling. */
  asChild?: boolean
  /** Glyph placed before the label (search icon, a `start` chevron). */
  startIcon?: React.ReactNode
  /** Glyph placed after the label (an `end` chevron). */
  endIcon?: React.ReactNode
}

export function Pressable({
  className,
  asChild = false,
  startIcon,
  endIcon,
  children,
  ...props
}: PressableProps) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp className={cn(pressableBase, className)} {...props}>
      {startIcon}
      <Slottable>{children}</Slottable>
      {endIcon}
    </Comp>
  )
}

export { pressableBase }
