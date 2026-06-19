import type { Experience, Media, Portfolio } from '@/payload-types'
import { keywordLabels } from '@/features/experience/projections'
import { experienceHref, portfolioHref } from '@/lib/routes'

/**
 * View-model for one landing card — the shared shape rendered by both the
 * Experience and Portfolio bands (the owner reuses one card layout for both).
 * Pure projection: the docs are fetched in `./queries`, shaped here.
 */
export type LandingCardData = {
  eyebrow?: string | null
  title: string
  tags: string[]
  href: string
  image?: Media | number | null
}

/** Project a Portfolio doc (depth>=1) to its landing card. */
export function portfolioCard(
  d: Pick<Portfolio, 'eyebrow' | 'title' | 'slug' | 'thumbnail' | 'scope' | 'craft'>,
): LandingCardData {
  return {
    eyebrow: d.eyebrow,
    title: d.title,
    tags: [...keywordLabels(d.scope), ...keywordLabels(d.craft)],
    href: portfolioHref(d.slug),
    image: d.thumbnail,
  }
}

/**
 * Project an Experience doc (depth>=1) to its landing card. Mirrors the portfolio
 * contract: company is the eyebrow, role the title, linking to /experience/[slug].
 */
export function experienceCard(
  d: Pick<Experience, 'role' | 'company' | 'slug' | 'companyLogo' | 'scope' | 'craft'>,
): LandingCardData {
  return {
    eyebrow: d.company,
    title: d.role,
    tags: [...keywordLabels(d.scope), ...keywordLabels(d.craft)],
    href: experienceHref(d.slug),
    image: d.companyLogo,
  }
}
