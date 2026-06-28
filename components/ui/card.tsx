import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

/**
 * Elevated surface. Two interaction axes from the Pressables board:
 *
 * - `interactive` — a pressable card (the feature/portfolio card). Hover grows a
 *   lime edge; focus shows the global fuchsia ring. Use with `asChild` to render
 *   the whole card as a `<Link>`.
 * - `selected` — the persisted "you are here" navigation state (the result-row /
 *   sidebar card). This is the one place selection reads **blue** (--selection),
 *   distinct from the lime affordance; a selected tag, by contrast, fills lime.
 *
 * Colour comes only from semantic roles; never raw stops or vars.
 */
const cardVariants = cva(
  'rounded-2xl border bg-card/30 p-6 transition outline-none',
  {
    variants: {
      interactive: {
        true: 'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:border-primary/50',
        false: '',
      },
      selected: {
        true: 'border-selection bg-selection/20',
        false: 'border-border',
      },
    },
    defaultVariants: { interactive: false, selected: false },
  },
)

export type CardProps = React.ComponentProps<'div'> &
  VariantProps<typeof cardVariants> & {
    /** Render the child element (e.g. a `<Link>`) with the card styling. */
    asChild?: boolean
  }

export function Card({ className, interactive, selected, asChild = false, ...props }: CardProps) {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp className={cn(cardVariants({ interactive, selected }), className)} {...props} />
  )
}

export { cardVariants }
