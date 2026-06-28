import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

/**
 * Pill primitive — a single keyword/label as a rounded chip. Used by the `tag`
 * variant of {@link List} (scope/craft on the experience page), inside cards, and
 * as a selectable filter chip.
 *
 * Per the Pressables board a **selected** chip fills lime (--primary): for a chip
 * the "on"/toggled state reads as the lime affordance, not the blue you-are-here
 * selection that a navigation result-row card uses. `tagVariants` is exported so
 * an interactive filter `<button>` can reuse the styling.
 */
const tagVariants = cva(
  'inline-flex items-center rounded-sm border px-2 py-[6px] text-ui transition',
  {
    variants: {
      selected: {
        true: 'border-primary bg-primary text-primary-foreground',
        false: 'border-border bg-muted text-muted-foreground',
      },
    },
    defaultVariants: { selected: false },
  },
)

export type TagProps = {
  children: React.ReactNode
  className?: string
} & VariantProps<typeof tagVariants>

export function Tag({ children, className, selected }: TagProps) {
  return <span className={cn(tagVariants({ selected }), className)}>{children}</span>
}

export { tagVariants }
