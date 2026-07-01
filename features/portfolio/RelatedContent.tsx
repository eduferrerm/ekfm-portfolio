import { MetaCard } from '@/components/primitives/MetaCard'

import type { RelatedItem } from './projections'

/**
 * "See also" cards to other work and to roles (resolved upstream from the
 * polymorphic relatedContent relationship). Renders the shared `MetaCard`
 * primitive so these read identically to the Dear Company relevant-content
 * cards. Renders nothing when empty.
 */
export function RelatedContent({ items, label }: { items: RelatedItem[]; label: string }) {
  if (items.length === 0) return null

  return (
    <section>
      <h2 className="mb-4 text-subheader text-label">{label}</h2>
      <ul className="flex flex-wrap gap-6">
        {items.map((item) => (
          <li key={item.href}>
            <MetaCard
              className="w-auto"
              href={item.href}
              eyebrow={item.eyebrow}
              title={item.title}
              thumbnail={item.thumbnail}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
