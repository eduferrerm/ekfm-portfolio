import type { Experience, Keyword, Media } from '@/payload-types'

/** One showcase gallery image with its optional "Visit site" url + caption. */
export type ShowcaseItem = {
  media: Media
  url?: string | null
  label?: string | null
}

/** View-model for one Deep Dive slide — a team narrative + a details list. */
export type DeepDiveView = {
  team: string
  details: string[]
}

/**
 * Resolve a scope/craft relationship value to its keyword labels, preserving
 * attach order (the authored display order — never re-sorted). Only works on a
 * depth>=1 query where the relationship is populated to objects; unpopulated
 * ids are skipped.
 */
export function keywordLabels(items?: (number | Keyword)[] | null): string[] {
  return (items ?? [])
    .map((k) => (typeof k === 'object' && k ? k.label : undefined))
    .filter((label): label is string => Boolean(label))
}

/** "March 2024" — month + year, the granularity Experience dates are authored at. */
export function formatMonth(date?: string | null): string {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

/** "March 2024 – Present" / "March 2022 – June 2023". */
export function dateRange(exp: Pick<Experience, 'startDate' | 'endDate' | 'current'>): string {
  const start = formatMonth(exp.startDate)
  const end = exp.current ? 'Present' : formatMonth(exp.endDate)
  return end ? `${start} – ${end}` : start
}

/** "2018 - 2021" / "2018 - Present" — year granularity for the detail header. */
export function yearRange(exp: Pick<Experience, 'startDate' | 'endDate' | 'current'>): string {
  const start = exp.startDate ? new Date(exp.startDate).getFullYear() : ''
  const end = exp.current ? 'Present' : exp.endDate ? new Date(exp.endDate).getFullYear() : ''
  return end ? `${start} - ${end}` : `${start}`
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
    team: entry.team ?? '',
    details: (entry.details ?? [])
      .map((d) => d.text)
      .filter((text): text is string => Boolean(text)),
  }))
}
