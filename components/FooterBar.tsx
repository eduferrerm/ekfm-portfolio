import Link from 'next/link'

import { BackToTop } from '@/components/BackToTop'
import { Container } from '@/components/Container'
import { TextLink } from '@/components/TextLink'
import { cn } from '@/lib/utils'

/**
 * The shared site footer bar — the utility hyperlinks (back-to-top, privacy)
 * grouped on the left, the "that is all" sign-off on the right. From `sm` up it's
 * one row (`--header-h` tall); on mobile it stacks vertically with a 40px gap
 * between the links and the sign-off, so it's taller (`h-32`) there.
 *
 * That mobile height is COUPLED: the landing reveals this footer `fixed` behind
 * the page through a matching bottom-margin gap on the Contact band, so
 * ContactBand mirrors `h-32 sm:h-(--header-h)` as `mb-32 sm:mb-(--header-h)` —
 * keep them in sync or the top link is clipped on the landing.
 *
 * Positioning is the caller's concern, passed via `className`: the landing reveals
 * it `fixed` behind the page (see features/landing/Footer), while inner pages and
 * /privacy render it in normal flow at the bottom of their content. One footer,
 * reachable from every page.
 */
export function FooterBar({
  className,
  lead = 'backToTop',
  homeHref = '/',
}: {
  className?: string
  /**
   * The leading link. `backToTop` (landing) smooth-scrolls up the long single
   * page; `home` (inner pages) navigates to `homeHref` — the visitor-scoped home
   * on a `/dear/[company]` mirror, otherwise `/`.
   */
  lead?: 'backToTop' | 'home'
  homeHref?: string
}) {
  const year = new Date().getFullYear()
  const linkOnLime = 'text-primary-foreground hover:opacity-70 focus-visible:ring-offset-primary'

  return (
    <footer className={cn('bg-primary flex h-32 items-center sm:h-(--header-h)', className)}>
      <Container className="flex flex-col items-center justify-center gap-10 sm:flex-row sm:justify-between sm:gap-4">
        <nav aria-label="Footer" className="flex items-center gap-2">
          {lead === 'home' ? (
            <TextLink asChild className={linkOnLime}>
              <Link href={homeHref}>Home</Link>
            </TextLink>
          ) : (
            <BackToTop />
          )}
          <TextLink asChild className={linkOnLime}>
            <Link href="/privacy">Privacy</Link>
          </TextLink>
        </nav>
        <p className="text-ui text-primary-foreground">That is all... 🚀 © {year}</p>
      </Container>
    </footer>
  )
}
