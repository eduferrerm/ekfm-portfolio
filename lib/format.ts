import type { Experience } from '@/payload-types'

/**
 * Display formatters for Experience dates. Pure presentation — distinct from the
 * projection mappers (these format a value; they don't reshape a doc into a view
 * model). Kept beside other cross-cutting formatting concerns in lib/.
 */

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
