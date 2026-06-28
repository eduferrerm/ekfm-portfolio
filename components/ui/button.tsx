import { Slot, Slottable } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { Chevron } from '@/components/primitives/Chevron'
import { cn } from '@/lib/utils'

/**
 * The pill/CTA family. Variants encode the brand's three emphasis tiers and the
 * interaction model decoded from the Pressables board:
 *
 * - **focus** is global — fuchsia ring (`ring-ring` → --accent) on every variant.
 * - **active (press) feedback** is global — a lime flash / dim.
 * - **hover**: primary (lime fill) trades its fill for a lime outline + lime label;
 *   secondary turns its slate outline + label lime; ghost — now icon-only chrome —
 *   grows a lime edge.
 * - **press** (active): primary flashes a faint lime fill (--feedback/20);
 *   secondary fills lime with a dark (--primary-foreground) label + chevron.
 *
 * Colour comes only from semantic roles (--primary/--border/--ring …), never raw
 * stops or vars. Render as a link with `asChild` (Radix Slot): the variant
 * classes compose onto the child `<Link>`/`<a>`.
 */
const buttonVariants = cva(
  'group/btn inline-flex items-center justify-center gap-3 whitespace-nowrap rounded-full border text-ui transition outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:opacity-40',
  {
    variants: {
      variant: {
        // Loudest. Lime fill + dark label/chevron; hover empties to a lime outline;
        // press flashes a faint lime fill (--feedback at 20%). md auto-carries an
        // end chevron (see Button) coloured by the label (text-current).
        primary:
          'border-transparent bg-primary text-primary-foreground hover:border-primary hover:bg-transparent hover:text-primary active:bg-feedback/20 active:text-primary-foreground',
        // Slate-300 outline + label, lime chevron; hover turns outline + label lime;
        // press fills lime with a dark (--primary-foreground) label/chevron. md
        // auto-carries an end chevron (see Button) held in text-primary, dark on press.
        secondary:
          'border-foreground bg-transparent text-foreground hover:border-primary hover:text-primary active:border-primary active:bg-primary active:text-primary-foreground',
        // Icon-only chrome (hamburger / back / close): transparent, glyph carried in
        // text-primary by the caller, hover grows a lime edge. No longer used for
        // text CTAs — those are `secondary` now.
        ghost:
          'border-transparent bg-transparent text-muted-foreground hover:border-primary hover:text-primary active:opacity-60',
      },
      // Sizes change padding only — every label stays the `text-ui` role
      // (brand "primary / regular", 14px) regardless of size.
      size: {
        sm: 'px-3 py-1',
        md: 'px-5 py-3',
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
    /**
     * Place the `Chevron` glyph before (`start`, points left) or after (`end`,
     * points right) the label — e.g. Prev/Next sliders, card CTAs. Composes
     * through `asChild` (the glyph lands inside the child `<Link>`/`<a>`/`<span>`).
     *
     * `secondary` text CTAs (md size) get a trailing chevron by default — pass
     * `chevron` only to override (e.g. `start`).
     */
    chevron?: 'start' | 'end'
    /**
     * Tailwind text-color utility for the chevron; defaults to `text-current`, so
     * the glyph inherits — and animates with — the label colour through hover.
     */
    chevronColor?: string
  }

export function Button({
  className,
  variant,
  size,
  asChild = false,
  chevron,
  chevronColor,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  const resolvedVariant = variant ?? 'primary'
  const resolvedSize = size ?? 'md'
  // primary + secondary text buttons (md) carry a trailing chevron by default; the
  // sm/icon triggers (Menu, search, chrome glyphs) stay glyph-free. Explicit wins.
  const placement =
    chevron ??
    ((resolvedVariant === 'primary' || resolvedVariant === 'secondary') && resolvedSize === 'md'
      ? 'end'
      : undefined)
  // Secondary's glyph is the blue label token (white on press); every other variant
  // inherits the label colour (text-current) so the glyph tracks it through hover.
  const glyphColor =
    chevronColor ??
    (resolvedVariant === 'secondary'
      ? 'text-primary group-active/btn:text-primary-foreground'
      : 'text-current')
  const glyph = placement && (
    <Chevron
      direction={placement === 'start' ? 'left' : 'right'}
      color={glyphColor}
      // `transition` so the glyph's fill (currentColor) eases with the label.
      className="h-3.5 w-auto transition"
    />
  )
  return (
    <Comp className={cn(buttonVariants({ variant, size }), className)} {...props}>
      {placement === 'start' && glyph}
      <Slottable>{children}</Slottable>
      {placement === 'end' && glyph}
    </Comp>
  )
}

export { buttonVariants }
