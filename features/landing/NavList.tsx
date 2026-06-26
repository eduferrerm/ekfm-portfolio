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
 * reveal per item. No hooks here, so the component is usable from both the server
 * hero band and the client sticky-reveal.
 */
export function NavList({
  items,
  className,
  linkClassName,
  itemClassName,
  decorative = false,
}: {
  items: NavItem[]
  className?: string
  linkClassName?: string
  itemClassName?: (index: number) => string
  decorative?: boolean
}) {
  return (
    <ul className={className} aria-hidden={decorative || undefined}>
      {items.map((item, i) => (
        <li key={item.slug} className={itemClassName?.(i)}>
          <a href={`#${item.slug}`} tabIndex={decorative ? -1 : undefined} className={linkClassName}>
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  )
}
