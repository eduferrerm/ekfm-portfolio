import 'server-only'

import { getPayload } from 'payload'
import config from '@payload-config'

import type { Landing } from '@/payload-types'
import type { NavSectionView } from '@/lib/nav'
import { PUBLISHED_ONLY } from '@/lib/preview'
import { scopeHref } from '@/lib/routes'
import { slugify } from '@/lib/slugify'
import { experienceYears, formatYearsLabel } from '@/lib/yoe'

import { experienceCard, portfolioCard, sectionNavViews, type LandingCardData } from './projections'

/**
 * Landing data-access (Payload Local API, no HTTP hop). Each query fetches lean
 * via `select` then hands the docs to the pure mappers in `./projections`.
 */

/**
 * The Landing global. depth:1 populates hero.craft labels + sections[].searchKeywords.
 * Draft-aware: without `draft` returns the published homepage; with `draft` (the
 * owner previewing) returns the working draft. A global has no `_status`
 * where-filter — `findGlobal` without `draft` already yields published.
 */
export async function landingGlobal({ draft = false } = {}): Promise<Landing> {
  const payload = await getPayload({ config })
  return payload.findGlobal({ slug: 'landing', depth: 1, draft })
}

/**
 * The section nav (SSOT: Landing.sections[]), shared by the desktop aside + the
 * mobile overlay menu. Lean fetch (sections only); projected to view-models with
 * their per-section href strategy in `sectionNavViews`.
 */
export async function sectionNav(scope = ''): Promise<NavSectionView[]> {
  const payload = await getPayload({ config })
  const landing = await payload.findGlobal({
    slug: 'landing',
    depth: 0,
    select: { sections: true },
  })
  return sectionNavViews(landing.sections, scope)
}

/**
 * Resolve a landing section's on-page anchor (e.g. '/#tldr') by its `key`. Backs
 * the section-shortcut routes (/tldr, /contact, /more-me): those aren't real
 * pages — they redirect to the matching landing band. Anchor = slugify(navLabel),
 * the same derivation the band ids + LandingNav use, so they always agree.
 * Returns null if the section isn't present (let the caller 404).
 */
export async function landingSectionAnchor(key: string, scope = ''): Promise<string | null> {
  const payload = await getPayload({ config })
  const landing = await payload.findGlobal({
    slug: 'landing',
    depth: 0,
    select: { sections: true },
  })
  const section = (landing.sections ?? []).find((s) => s.key === key)
  return section ? scopeHref(`/#${slugify(section.navLabel)}`, scope) : null
}

/** Portfolio landing cards, in display `order` (ascending). depth:1 populates the
 * spotlight tag labels + the thumbnail; `select` keeps the read lean. */
export async function portfolioCards(scope = ''): Promise<LandingCardData[]> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'portfolio',
    where: PUBLISHED_ONLY,
    sort: 'order',
    limit: 1000,
    depth: 1,
    select: { eyebrow: true, title: true, slug: true, thumbnail: true, spotlight: true },
  })
  return docs.map((d) => portfolioCard(d, scope))
}

/** Experience landing cards, newest first. Published-only: a draft role must not
 * surface as a card on the public landing (draft preview is scoped to the
 * experience section in phase 1; the landing adopts drafts in phase 3). */
export async function experienceCards(scope = ''): Promise<LandingCardData[]> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'experience',
    where: PUBLISHED_ONLY,
    sort: '-startDate',
    limit: 1000,
    depth: 1,
    select: { role: true, company: true, slug: true, companyLogo: true, spotlight: true },
  })
  return docs.map((d) => experienceCard(d, scope))
}

/**
 * Formatted years-of-experience label (e.g. "8+ years") for the TL;DR band,
 * computed as a union of role date intervals so overlapping roles count once.
 * Returns '' when there are no datable roles. Evaluated at ISR regeneration via
 * `new Date()` — granularity (whole years) makes hourly recompute ample.
 */
export async function experienceYearsLabel(): Promise<string> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'experience',
    where: PUBLISHED_ONLY,
    limit: 1000,
    depth: 0,
    select: { startDate: true, endDate: true, current: true },
  })
  return formatYearsLabel(experienceYears(docs, new Date()))
}
