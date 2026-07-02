'use client'

import Link from 'next/link'

import { MediaImage } from '@/components/primitives/MediaImage'
import { Tag } from '@/components/primitives/Tag'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

import type { LandingCardData } from './projections'

/**
 * One feature/role card on the landing — avatar, eyebrow, title, tags, and a CTA.
 * Shared by the Experience and Portfolio bands; the whole card is the link, so the
 * CTA is a faux-button (a styled span) that lights up on card hover via
 * `group-hover`, not its own hover.
 *
 * `onFocus` scrolls the card fully into the scroll shelf on keyboard focus —
 * native focus-scroll leaves a partially-visible card partly clipped, so we do it
 * explicitly (`inline: 'nearest'` respects the shelf's scroll-padding gutter).
 */
export function LandingCard({ card, ctaLabel }: { card: LandingCardData; ctaLabel: string }) {
  return (
    <Card
      asChild
      interactive
      onFocus={(e) => e.currentTarget.scrollIntoView({ block: 'nearest', inline: 'nearest' })}
      // Controlled fixed width + `shrink-0` in the scroll shelf at every
      // breakpoint. `aspect-[3/4]` keeps every card the same 3:4 portrait shape.
      className="group flex aspect-[3/4] flex-col gap-4 w-65 shrink-0 lg:w-82.5"
    >
      <Link href={card.href}>
        {card.image && (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-indigo-500 to-fuchsia-500">
            <MediaImage media={card.image} className="h-full w-full object-cover" />
          </span>
        )}
        <div className="mb-2">
          {card.eyebrow && (
            <p className="text-eyebrow text-muted-foreground mb-2">{card.eyebrow}</p>
          )}
          <h3 className="text-card-title">{card.title}</h3>
        </div>
        {card.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {/* Below md the card is narrow, so only the first three spotlight tags
                show; the curated remainder (≤5) unhides from md up. CSS-only so it
                stays SSG-safe — no media-query hook, no hydration flash. */}
            {card.tags.map((t, i) => (
              <Tag key={t} className={i >= 3 ? 'max-md:hidden' : undefined}>
                {t}
              </Tag>
            ))}
          </div>
        )}
        <Button asChild variant="secondary" className="mt-auto w-fit">
          <span>{ctaLabel}</span>
        </Button>
      </Link>
    </Card>
  )
}
