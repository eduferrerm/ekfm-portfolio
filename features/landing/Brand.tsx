import { Logo } from '@/components/Logo'
import { cn } from '@/lib/utils'

/**
 * The EKFM wordmark — one of the few literal (non-CMS) bits of site chrome.
 * Rendered twice on the landing: large in the centered hero, and small in the
 * sticky nav (where it reveals on scroll). Non-linking (the hero/sticky mark is
 * decorative chrome, unlike the home-linking `@/components/Brand`); it shares the
 * same `Logo` glyph. Pass `className` to size/space it (the glyph is `em`-sized,
 * so a `text-*` class scales it). `role="img"` + `aria-label` keep the "EKFM"
 * accessible name the bare glyph would otherwise drop.
 */
export function Brand({ className }: { className?: string }) {
  return (
    <span role="img" aria-label="EKFM" className={cn('inline-flex text-primary', className)}>
      <Logo />
    </span>
  )
}
