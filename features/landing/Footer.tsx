import { FooterBar } from '@/components/FooterBar'

/**
 * The landing's footer — the shared `FooterBar` pinned to the very bottom of the
 * document, the same height as the sticky nav (`--header-h`). It sits *behind* the
 * page (`<main>` is `relative z-10`, opaque), so it is never scrolled *to*: the
 * Contact band's matching bottom margin opens a gap the same height as the footer,
 * and the footer is revealed underneath as the reader scrolls past Contact. That
 * reveal is landing-only; inner pages render the same `FooterBar` in normal flow.
 * The footer's height (`h-32 sm:h-(--header-h)`) is mirrored by the Contact band's
 * bottom-margin gap so the reveal coupling holds at every width.
 */
export function Footer() {
  return <FooterBar className="fixed inset-x-0 bottom-0 z-0" />
}
