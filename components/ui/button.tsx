import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

/**
 * The pill/CTA family. Variants encode the brand's three emphasis tiers and the
 * interaction model decoded from the Pressables board:
 *
 * - **focus** is global — fuchsia ring (`ring-ring` → --accent) on every variant.
 * - **active (press) feedback** is global — a lime flash / dim.
 * - **hover** uses lime (--primary) as the affordance: it *fills* outline buttons
 *   and *inverts* the solid one. Per the board, the primary pill trades its lime
 *   fill for a lime outline on hover; secondary/ghost gain a lime edge/fill.
 *
 * Colour comes only from semantic roles (--primary/--border/--ring …), never raw
 * stops or vars. Render as a link with `asChild` (Radix Slot): the variant
 * classes compose onto the child `<Link>`/`<a>`.
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full border text-ui transition outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:opacity-40',
  {
    variants: {
      variant: {
        // Loudest. Default lime fill; hover inverts to a lime outline; press dims.
        primary:
          'border-transparent bg-primary text-primary-foreground hover:border-primary hover:bg-transparent hover:text-primary active:opacity-60',
        // Quieter outline that fills lime on hover; press uses the feedback flash.
        secondary:
          'border-border bg-transparent text-foreground hover:border-primary hover:bg-primary hover:text-primary-foreground active:bg-feedback active:text-primary-foreground',
        // Faint text that grows a lime edge on hover (e.g. "Feature Details").
        ghost:
          'border-transparent bg-transparent text-muted-foreground hover:border-primary hover:text-primary active:opacity-60',
      },
      // Sizes change padding only — every label stays the `text-ui` role
      // (brand "primary / regular", 14px) regardless of size.
      size: {
        sm: 'px-3 py-1',
        md: 'px-4 py-2',
        // Square, label-free — wraps a single lucide/Chevron icon (search mobile
        // back/close, nav hamburger/close). The icon sizes itself (h-5 w-5).
        icon: 'p-2',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

export type ButtonProps = React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    /** Render the child element (e.g. `<Link>`/`<a>`) with the button styling. */
    asChild?: boolean
  }

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />
}

export { buttonVariants }
