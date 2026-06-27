import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

/**
 * Text input primitive. Per the Pressables board, **focus is the global fuchsia
 * ring** (`ring-ring` → --accent) — an input is just another pressable, so it
 * shares the focus channel with Button/Card rather than swapping its border to
 * lime (which would read as the hover/affordance channel). Colour comes only from
 * semantic roles (--input/--muted/--ring …), never raw stops or vars.
 *
 * Layout (an icon's `pl-9`, width) stays at the call site via `className`; the
 * primitive owns only the surface, the `text-body` role, and the four channels.
 */
const inputVariants = cva(
  'w-full rounded-lg border border-input bg-muted/40 px-3 py-2 text-body text-foreground placeholder:text-muted-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-40',
)

export type InputProps = React.ComponentProps<'input'> & VariantProps<typeof inputVariants>

export function Input({ className, ...props }: InputProps) {
  return <input className={cn(inputVariants(), className)} {...props} />
}

export { inputVariants }
