import type { Experience, Landing, Media, Portfolio } from '@/payload-types'
import { keywordLabels } from '@/lib/keywords'
import { ROUTED_SECTIONS, type NavSectionView, type SectionKey } from '@/lib/nav'
import { experienceHref, portfolioHref } from '@/lib/routes'
import { slugify } from '@/lib/slugify'

/**
 * Project Landing.sections[] (the SSOT for the navigable section list) to the
 * aside/mobile nav view-models. Same rows LandingNav renders; the difference is
 * the href strategy — routed sections (experience/portfolio) point at their
 * detail route, the rest at their landing band anchor (/#slug, the same id the
 * band renders). Order + labels come straight from the CMS.
 */
export function sectionNavViews(sections: Landing['sections']): NavSectionView[] {
  return (sections ?? []).map((s) => {
    const key = s.key as SectionKey
    const routed = ROUTED_SECTIONS.has(key)
    return {
      key,
      label: s.navLabel,
      href: routed ? `/${key}` : `/#${slugify(s.navLabel)}`,
      routed,
    }
  })
}

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
