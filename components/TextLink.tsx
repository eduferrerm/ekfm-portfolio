import { Pressable, type PressableProps } from '@/components/primitives/Pressable'
import { cn } from '@/lib/utils'

/**
 * A design-system text hyperlink — the understated sibling of the pill `Button`.
 * It reuses `Pressable` for the shared interaction mechanism (the global fuchsia
 * `ring-ring` focus channel, `asChild`, disabled), and adds only the link *skin*:
 * the `text-ui` label role, an underline affordance, `rounded-sm` + modest padding
 * so the focus ring clears the glyphs.
 *
 * It is deliberately colour-neutral (inherits `currentColor`): the caller sets the
 * colour + hover for its surface — lime hover (`hover:text-primary`) on dark
 * surfaces, an opacity/decoration shift on the lime footer — so one component
 * serves both without baking in a hover that would vanish on a matching ground.
 *
 * Render as a link with `asChild` (`<TextLink asChild><Link …/></TextLink>`) or
 * as a `<button>` by passing `onClick` (e.g. "back to top").
 */
export function TextLink({ className, children, ...props }: PressableProps) {
  return (
    <Pressable
      className={cn('text-ui rounded-sm px-1 py-0.5 underline underline-offset-4', className)}
      {...props}
    >
      {children}
    </Pressable>
  )
}
