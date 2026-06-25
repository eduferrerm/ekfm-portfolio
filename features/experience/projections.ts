import type { Experience, Media } from '@/payload-types'
import type { NavItem } from '@/lib/nav'
import { proseLines } from '@/lib/prose'
import { experienceHref } from '@/lib/routes'

/** Project an Experience doc (depth>=1) to an aside nav sub-item: company over role. */
export function experienceNavItem(
  d: Pick<Experience, 'role' | 'company' | 'slug' | 'companyLogo'>,
  scope = '',
): NavItem {
  return {
    href: experienceHref(d.slug, scope),
    primary: d.company,
    secondary: d.role,
    thumbnail: d.companyLogo,
  }
}

/** One showcase gallery image with its optional "Visit site" url + caption. */
export type ShowcaseItem = {
  media: Media
  url?: string | null
  label?: string | null
}

/** View-model for one Deep Dive slide — a titled narrative + a details list. */
export type DeepDiveView = {
  title: string
  description: string
  details: string[]
}

/**
 * Resolve the showcase array to renderable gallery items. Needs depth>=1 (the
 * image populated to a Media object); rows whose image is unpopulated or missing
 * are skipped.
 */
export function showcaseItems(items?: Experience['showcase']): ShowcaseItem[] {
  return (items ?? [])
    .map((item): ShowcaseItem | null =>
      typeof item.image === 'object' && item.image
        ? { media: item.image, url: item.url, label: item.label }
        : null,
    )
    .filter((item): item is ShowcaseItem => Boolean(item))
}

/** Map authored deepDive entries to slide view-models (drops empty details). */
export function deepDiveViews(items?: Experience['deepDive']): DeepDiveView[] {
  return (items ?? []).map((entry) => ({
    title: entry.title ?? '',
    description: entry.description ?? '',
    details: proseLines(entry.details),
  }))
}
