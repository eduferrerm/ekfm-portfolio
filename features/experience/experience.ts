import type { Experience, Keyword } from '@/payload-types'

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
