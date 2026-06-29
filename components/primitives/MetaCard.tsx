'use client'

import Image from 'next/image'
import Link from 'next/link'
import { forwardRef, type Ref } from 'react'

import { MediaImage } from '@/components/primitives/MediaImage'
import type { Media } from '@/payload-types'
import { cn } from '@/lib/utils'

/**
 * A compact reference to a piece of content: a thumbnail (or a first-initial
 * placeholder) beside a small category eyebrow over the bold name. The shared
 * primitive behind the search palette's result/expectation rows and the Dear
 * Company "relevant content" cards, so they read identically (per the board:
 * the category is the bold one — `text-ui-bold`, natural case, NOT an uppercase
 * eyebrow — and the name below stays regular `text-ui`).
 *
 * Polymorphic on two axes:
 * - **thumbnail** accepts a resolved URL string (search corpus, already hydrated)
 *   OR an unpopulated Payload `Media` (server relations), rendered through
 *   `MediaImage`; a missing/unpopulated image falls back to the title's initial.
 * - **wrapper** is a `<button>` when given `onSelect` (the palette owns navigation
 *   + analytics) or a `<Link>` when given `href`. The ref + any extra DOM props
 *   (onMouseEnter, aria-current…) forward onto whichever element renders.
 *
 * Selection reads BLUE (--selection, the persisted "you are here" channel, same
 * token Card's `selected` variant uses); the base border reserves the space so
 * selecting never shifts layout. Focus is the global fuchsia ring.
 */
export type MetaCardProps = {
  /**
   * Top line — the category/descriptor (bold, muted): "Feature", "Experience",
   * a tagline. Omitted → the title centres on its own.
   */
  eyebrow?: string | null
  /** Bottom line — the item's own name (regular, foreground): "Custom Routes". */
  title: string
  /** A resolved URL string, an (un)populated Payload Media, or nothing. */
  thumbnail?: string | Media | number | null
  active?: boolean
  className?: string
} & (
  | { href: string; onSelect?: never }
  | { onSelect: () => void; href?: never }
) &
  Omit<React.HTMLAttributes<HTMLElement>, 'title' | 'children'>

export const MetaCard = forwardRef<HTMLElement, MetaCardProps>(function MetaCard(
  { eyebrow, title, thumbnail, active = false, href, onSelect, className, ...rest },
  ref,
) {
  const classes = cn(
    // Three channels: focus = global fuchsia ring; press (:active) = the lime
    // feedback flash (--feedback border + /20 fill), the same channel Button
    // presses with; selection = persisted blue (--selection) "you are here".
    // Press overrides selection while held — Tailwind orders the active: variant
    // after the base, so the lime wins during the press.
    'flex w-full items-center gap-3 rounded-lg border px-2 py-2 text-left transition outline-none active:border-feedback active:bg-feedback/20 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    active ? 'border-selection bg-selection/20' : 'border-transparent hover:bg-muted/60',
    className,
  )

  const inner = (
    <>
      <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
        {typeof thumbnail === 'string' && thumbnail ? (
          <Image src={thumbnail} alt="" fill sizes="36px" className="object-cover" />
        ) : thumbnail && typeof thumbnail === 'object' && 'url' in thumbnail && thumbnail.url ? (
          <MediaImage media={thumbnail} className="h-full w-full object-cover" />
        ) : (
          <span
            aria-hidden
            className="flex h-full w-full items-center justify-center text-xs font-semibold text-muted-foreground"
          >
            {title.charAt(0).toUpperCase()}
          </span>
        )}
      </span>
      <span className="min-w-0 flex-1">
        {eyebrow && (
          <span className="block truncate text-ui-bold text-muted-foreground">{eyebrow}</span>
        )}
        <span className="block truncate text-ui text-foreground">{title}</span>
      </span>
    </>
  )

  if (href) {
    return (
      <Link
        ref={ref as Ref<HTMLAnchorElement>}
        href={href}
        data-active={active}
        className={classes}
        {...rest}
      >
        {inner}
      </Link>
    )
  }

  return (
    <button
      ref={ref as Ref<HTMLButtonElement>}
      type="button"
      onClick={onSelect}
      data-active={active}
      className={classes}
      {...rest}
    >
      {inner}
    </button>
  )
})
