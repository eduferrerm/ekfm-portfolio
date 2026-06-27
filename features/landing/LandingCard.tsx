import Link from 'next/link'

import { MediaImage } from '@/components/primitives/MediaImage'
import { Tag } from '@/components/primitives/Tag'

import type { LandingCardData } from './projections'

/**
 * One feature/role card on the landing — avatar, eyebrow, title, tags, and a CTA.
 * Shared by the Experience and Portfolio bands; the whole card is the link.
 */
export function LandingCard({ card, ctaLabel }: { card: LandingCardData; ctaLabel: string }) {
  return (
    <Link
      href={card.href}
      className="group flex flex-col gap-4 rounded-2xl border border-border bg-card/30 p-6 transition hover:border-primary/50"
    >
      {card.image && (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500">
          <MediaImage media={card.image} className="h-full w-full object-cover" />
        </span>
      )}
      <div>
        {card.eyebrow && (
          <p className="text-eyebrow text-primary">
            {card.eyebrow}
          </p>
        )}
        <h3 className="mt-1 text-card-title">{card.title}</h3>
      </div>
      {card.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {card.tags.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>
      )}
      <span className="mt-auto inline-flex w-fit items-center rounded-full border border-border px-4 py-2 text-sm font-medium transition group-hover:bg-muted">
        {ctaLabel}
      </span>
    </Link>
  )
}
