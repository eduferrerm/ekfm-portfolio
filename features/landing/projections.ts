import 'server-only'

import { getPayload } from 'payload'
import config from '@payload-config'

import type { Media } from '@/payload-types'
import { keywordLabels } from '@/features/experience/experience'

/**
 * View-model for one landing card — the shared shape rendered by both the
 * Experience and Portfolio bands (the owner reuses one card layout for both).
 * The cards project from their collections, not from the Landing global.
 */
export type LandingCardData = {
  eyebrow?: string | null
  title: string
  tags: string[]
  href: string
  image?: Media | number | null
}

/** Flatten an array of `{ text }` rows to non-empty strings (prose helper). */
export function proseLines(rows?: { text?: string | null }[] | null): string[] {
  return (rows ?? []).map((r) => r.text).filter((t): t is string => Boolean(t))
}

/**
 * Portfolio landing cards, in display `order` (ascending). depth:1 populates the
 * scope/craft labels + the thumbnail; `select` keeps the read lean.
 */
export async function portfolioCards(): Promise<LandingCardData[]> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'portfolio',
    sort: 'order',
    limit: 1000,
    depth: 1,
    select: { eyebrow: true, title: true, slug: true, thumbnail: true, scope: true, craft: true },
  })
  return docs.map((d) => ({
    eyebrow: d.eyebrow,
    title: d.title,
    tags: [...keywordLabels(d.scope), ...keywordLabels(d.craft)],
    href: d.slug ? `/portfolio/${d.slug}` : '/portfolio',
    image: d.thumbnail,
  }))
}

/**
 * Experience landing cards, newest first. Mirrors the portfolio card contract:
 * the company is the eyebrow, the role the title, and the card links to the
 * per-role detail page at /experience/[slug].
 */
export async function experienceCards(): Promise<LandingCardData[]> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'experience',
    sort: '-startDate',
    limit: 1000,
    depth: 1,
    select: { role: true, company: true, slug: true, companyLogo: true, scope: true, craft: true },
  })
  return docs.map((d) => ({
    eyebrow: d.company,
    title: d.role,
    tags: [...keywordLabels(d.scope), ...keywordLabels(d.craft)],
    href: d.slug ? `/experience/${d.slug}` : '/experience',
    image: d.companyLogo,
  }))
}
