/**
 * Years-of-experience as a UNION of date intervals, not a sum: overlapping roles
 * (e.g. a contract held alongside a full-time job) count once, not twice. Pure +
 * side-effect-free so it stays trivially testable; the data read lives in the
 * landing query (features/landing/queries.ts).
 */

type DateInterval = { start: Date; end: Date }

/** Role date shape as read from the Experience collection. */
export type RoleDates = {
  startDate?: string | null
  endDate?: string | null
  current?: boolean | null
}

/** Merge overlapping/adjacent intervals, then total their span in (fractional) years. */
function unionYears(intervals: DateInterval[]): number {
  const sorted = intervals
    .filter((i) => i.end > i.start)
    .sort((a, b) => a.start.getTime() - b.start.getTime())
  if (sorted.length === 0) return 0

  const merged: DateInterval[] = []
  for (const iv of sorted) {
    const last = merged[merged.length - 1]
    if (last && iv.start <= last.end) {
      // Overlaps (or touches) the running interval — extend it.
      if (iv.end > last.end) last.end = iv.end
    } else {
      merged.push({ ...iv })
    }
  }

  const ms = merged.reduce((sum, i) => sum + (i.end.getTime() - i.start.getTime()), 0)
  return ms / (1000 * 60 * 60 * 24 * 365.25)
}

/**
 * Whole years of experience across all roles. An open role (`current`, or simply
 * missing `endDate`) runs to `now`. Floored — we report a confident minimum (the
 * `+` suffix is added by {@link formatYearsLabel}).
 */
export function experienceYears(roles: RoleDates[], now: Date): number {
  const intervals = roles
    .map((r): DateInterval | null => {
      if (!r.startDate) return null
      const start = new Date(r.startDate)
      if (Number.isNaN(start.getTime())) return null
      const end = r.current || !r.endDate ? now : new Date(r.endDate)
      if (Number.isNaN(end.getTime())) return null
      return { start, end }
    })
    .filter((iv): iv is DateInterval => iv !== null)

  return Math.floor(unionYears(intervals))
}

/** "8+ years" — floored count plus a confident-minimum suffix. Empty when zero. */
export function formatYearsLabel(years: number): string {
  return years > 0 ? `${years}+ years` : ''
}
