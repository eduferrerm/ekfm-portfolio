import Link from 'next/link'

import type { RelatedItem } from './portfolio'

/**
 * "See also" links to other work and to roles (resolved upstream from the
 * polymorphic relatedContent relationship). Renders nothing when empty.
 */
export function RelatedContent({ items, label }: { items: RelatedItem[]; label: string }) {
  if (items.length === 0) return null

  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold text-blue-500">{label}</h2>
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="text-foreground underline-offset-4 hover:underline"
            >
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
