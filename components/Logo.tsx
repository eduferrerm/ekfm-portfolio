import { cn } from '@/lib/utils'

/**
 * The EKFM wordmark glyph — the boxed "EKFM" lettermark (the box frame is part of
 * the artwork, so it replaces the old bordered text placeholder wholesale).
 *
 * Inline SVG (not next/image) so it inherits colour via `currentColor`: callers
 * set `text-primary` on the wrapping Brand and the mark tracks the lime token
 * instead of the hardcoded export hex (#D4F897) — one source of brand lime, the
 * palette. Purely decorative (`aria-hidden`); the wrapping Brand link/span carries
 * the accessible name. Height is `em`-based so the surrounding `text-*` size the
 * call sites already set (hero `text-lg`, inherited elsewhere) scales it.
 *
 * Source artwork: public/brand/asset-ekfm-logo.svg (80×26).
 */
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 26"
      fill="currentColor"
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
      className={cn('block h-[1.625em] w-auto', className)}
    >
      <path d="M60.5371 9L62.332 14.5957L64.1279 9H66.6738V17.043H64.7295V15.165L64.918 11.3203L62.9736 17.043H61.6914L59.7441 11.3174L59.9346 15.165V17.043H57.9961V9H60.5371Z" />
      <path d="M49.1084 9V10.4971H45.667V12.3477H48.7939V13.8389H45.667V17.043H43.7285V9H49.1084Z" />
      <path d="M30.3496 12.5469L31.0244 11.5244L32.7588 9H35.1504L32.4355 12.5518L35.1504 17.043H32.8584L31.1436 14.0518L30.3496 14.9199V17.043H28.4111V9H30.3496V12.5469Z" />
      <path d="M19.5518 9V10.4971H15.9385V12.1924H18.9824V13.6348H15.9385V15.5518H19.5352V17.043H14V9H19.5518Z" />
      <path d="M80 26H0V0H80V26ZM3 3V23H77V3H3Z" />
    </svg>
  )
}
