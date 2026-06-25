import Link from 'next/link'

/**
 * Site brand mark, linking home. Currently the text placeholder that matches the
 * design (boxed, primary/lime). Built to take a real logo: pass an inline `<svg>`
 * (use `fill="currentColor"` so it inherits `text-primary`) or any imported asset
 * as `mark` — no next.config/SVGR change is needed for inline SVG. (A
 * CMS-managed SVG rendered via next/image would need `dangerouslyAllowSVG`.)
 */
export function Brand({
  mark,
  className,
  href = '/',
}: {
  mark?: React.ReactNode
  className?: string
  href?: string
}) {
  return (
    <Link href={href} aria-label="EKFM — home" className={className}>
      {mark ?? (
        <span className="rounded border border-primary px-2 py-0.5 text-sm font-bold tracking-widest text-primary">
          EKFM
        </span>
      )}
    </Link>
  )
}
