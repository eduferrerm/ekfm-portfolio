import type { Experience, Keyword, Media } from '@/payload-types'
import { proseLines } from '@/lib/prose'

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
