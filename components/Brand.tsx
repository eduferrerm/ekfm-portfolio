import Link from 'next/link'

import { cn } from '@/lib/utils'

import { Logo } from './Logo'

/**
 * Site brand mark, linking home — the EKFM `Logo` glyph, lime via `text-primary`
 * (the mark inherits it through `currentColor`). Pass `mark` to override the glyph
 * with any other node (the slot is kept for one-off surfaces); otherwise it's the
 * shared `Logo`.
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
    <Link href={href} aria-label="EKFM — home" className={cn('inline-flex text-primary', className)}>
      {mark ?? <Logo />}
    </Link>
  )
}
