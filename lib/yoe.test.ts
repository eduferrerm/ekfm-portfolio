import { describe, expect, it } from 'vitest'

import { experienceYears, formatYearsLabel } from './yoe'

// Intervals carry comfortable buffers past the integer year so the 365.25-day
// divisor + floor don't tip a boundary case the wrong way.
const now = new Date('2024-06-01')

describe('experienceYears', () => {
  it('sums disjoint intervals (floored union)', () => {
    expect(
      experienceYears(
        [
          { startDate: '2000-01-01', endDate: '2002-06-01' }, // ~2.4y
          { startDate: '2010-01-01', endDate: '2012-06-01' }, // ~2.4y
        ],
        now,
      ),
    ).toBe(4) // ~4.8 floored
  })

  it('counts overlapping roles once — union, not sum', () => {
    expect(
      experienceYears(
        [
          { startDate: '2000-01-01', endDate: '2005-06-01' }, // ~5.4y
          { startDate: '2003-01-01', endDate: '2004-01-01' }, // fully inside the first
        ],
        now,
      ),
    ).toBe(5) // union ~5.4 floored; summing would give 6
  })

  it('runs an open (current) role to now', () => {
    expect(experienceYears([{ startDate: '2020-01-01', current: true }], now)).toBe(4)
  })

  it('ignores roles with missing or invalid startDate', () => {
    expect(experienceYears([{ startDate: null }, { startDate: 'not-a-date' }], now)).toBe(0)
  })
})

describe('formatYearsLabel', () => {
  it('adds the + suffix, empty at zero', () => {
    expect(formatYearsLabel(8)).toBe('8+ years')
    expect(formatYearsLabel(0)).toBe('')
  })
})
