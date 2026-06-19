import type { Media } from '@/payload-types'

/**
 * Landing section keys — the code-bound enum (mirrors the Landing global's
 * SECTION_KEYS). This is the ONLY part of the section nav that lives in code: the
 * label, order, and which sections exist are CMS-owned (Landing.sections[], the
 * single source of truth that also drives LandingNav). Do not hardcode a parallel
 * section list here.
 */
export type SectionKey = 'tldr' | 'experience' | 'portfolio' | 'moreAboutMe' | 'contact'

/**
 * Sections that have a routed inner page with a nested sub-nav (route path ===
 * key). Every other section is landing-anchor-only: it has no inner-page
 * presence, so from a detail page it cross-links back to its landing band
 * (/#slug). This routed-vs-anchor split is the only behavioural difference
 * between the aside nav and LandingNav — both render the same section list.
 */
export const ROUTED_SECTIONS: ReadonlySet<SectionKey> = new Set(['experience', 'portfolio'])

/**
 * One section in the aside / mobile nav, projected from a Landing.sections[] row.
 * `routed` sections link to their detail route and can show nested items + an
 * active state; the rest link to their landing band anchor.
 */
export type NavSectionView = {
  key: SectionKey
  label: string
  href: string
  routed: boolean
}

/**
 * One nested sub-nav entry under the active routed section — a role (Experience)
 * or a feature (Portfolio). `primary`/`secondary` are the two display lines; the
 * thumbnail needs a depth>=1 Media object to render (see SiteNav / MediaImage).
 */
export type NavItem = {
  href: string
  primary: string
  secondary?: string | null
  thumbnail?: Media | number | null
}
