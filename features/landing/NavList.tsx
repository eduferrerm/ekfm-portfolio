import { cn } from '@/lib/utils'

export type NavItem = { label: string; slug: string }

/**
 * The landing nav links (`#slug` same-page anchors — scope-agnostic, so they work
 * unchanged on `/` and `/dear/[company]`). Rendered twice: the canonical sticky
 * copy and the decorative in-hero copy.
 *
 * `decorative` strips the copy from the accessibility tree (`aria-hidden` +
 * unfocusable links) so assistive tech and crawlers see a single nav landmark
 * even though the links appear twice in the DOM — see the duplicate-nav note in
 * the sticky nav. `itemClassName(i)` lets the sticky copy drive its staggered
 * reveal per item. `activeSlug` + `activeLinkClassName` highlight the
 * scrolled-to section (the sticky copy passes these; the decorative copy doesn't,
 * so the active style and `aria-current` stay on the single real nav). No hooks
 * here, so the component is usable from both the server hero band and the client
 * sticky-reveal.
 */
export function NavList({
  items,
  className,
  linkClassName,
  itemClassName,
  decorative = false,
  activeSlug,
  activeLinkClassName,
}: {
  items: NavItem[]
  className?: string
  linkClassName?: string
  itemClassName?: (index: number) => string
  decorative?: boolean
  activeSlug?: string | null
  activeLinkClassName?: string
}) {
  return (
    <ul className={className} aria-hidden={decorative || undefined}>
      {items.map((item, i) => {
        const active = !decorative && item.slug === activeSlug
        return (
          <li key={item.slug} className={itemClassName?.(i)}>
            <a
              href={`#${item.slug}`}
              tabIndex={decorative ? -1 : undefined}
              aria-current={active ? 'location' : undefined}
              className={cn(linkClassName, active && activeLinkClassName)}
            >
              {item.label}
            </a>
          </li>
        )
      })}
    </ul>
  )
}
