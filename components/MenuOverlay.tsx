'use client'

import { Menu, X } from 'lucide-react'
import { type ReactNode, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import { Brand } from '@/components/Brand'
import { Container } from '@/components/Container'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * The shared hamburger menu — a lime `Menu` trigger that opens a full-screen
 * overlay. One model, two shells: the landing (flat `#anchor` list) and the
 * experience/portfolio chrome (the `SiteNav` tree) both render it, differing only
 * in the `children` they pass as the overlay body.
 *
 * The overlay mirrors the host top bar exactly: its top row reuses `Container`
 * (the same 1200px column + `px-6` gutter) AND the shared `--header-h` row height,
 * so the EKFM mark lands in the SAME spot it occupies in the bar — horizontally
 * and vertically — and the close X anchors the right edge where Search / the
 * trigger sit. Nothing jumps as it opens. `bg-sunken` recesses the panel
 * below the page. While open we lock background scroll and let Escape close (the
 * modal affordances the inline row doesn't need); tapping any link in the body
 * bubbles up and dismisses it.
 */
export function MenuOverlay({
  id,
  children,
  home,
  search,
  triggerClassName,
}: {
  id: string
  /** Overlay body — the nav content (anchor list or `SiteNav` tree). */
  children: ReactNode
  /** Home link for the overlay's EKFM mark (visitor scope passes its landing). */
  home?: { href: string } | null
  /**
   * Below md the Search trigger moves out of the top bar and lives here, pinned to
   * the drawer's bottom-right (hidden from md up, where the bar carries it). It sits
   * OUTSIDE the tap-to-dismiss body so opening search doesn't unmount the drawer.
   */
  search?: ReactNode
  /** Extra classes for the hamburger trigger (e.g. the landing reveal stagger). */
  triggerClassName?: string
}) {
  const [open, setOpen] = useState(false)

  // Standard modal affordances while open — lock background scroll, Escape closes.
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open])

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls={id}
        className={cn('text-primary', triggerClassName)}
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Portaled to <body>: the sticky nav's `backdrop-blur` (and any other
          ancestor filter/transform) would otherwise establish a containing block
          and trap this `fixed` panel at the bar's height. */}
      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            id={id}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            // Full-height sheet on phones; from tablet up it's a drawer that hugs
            // its content (height = content, capped to the viewport so long menus
            // still scroll), with a bottom edge to read as a panel over the page.
            className="fixed inset-x-0 top-0 z-50 flex h-dvh max-h-dvh flex-col overflow-y-auto bg-sunken md:h-auto md:border-b md:border-border"
          >
          <Container className="flex h-(--header-h) items-center justify-between">
            <Brand href={home?.href ?? '/'} />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="text-primary"
            >
              <X className="h-6 w-6" />
            </Button>
          </Container>
          <Container className="pb-12">
            {/* Tapping any link bubbles here and dismisses the overlay. */}
            <div className="pt-6" onClick={() => setOpen(false)}>
              {children}
            </div>
          </Container>
          {/* Below-md Search slot, pinned bottom-right (`mt-auto` in the flex column).
              Not inside the tap-to-dismiss body above: opening search must NOT close
              the drawer, or the drawer (and this instance) would unmount mid-open. */}
          {search && (
            <Container className="mt-auto flex justify-end pb-12 pt-6 md:hidden">
              {search}
            </Container>
          )}
          </div>,
          document.body,
        )}
    </>
  )
}
