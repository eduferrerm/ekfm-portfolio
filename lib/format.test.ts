import { describe, expect, it } from 'vitest'

import { dateRange, formatMonth, yearRange } from './format'

// Mid-month dates throughout: keeps the UTC-parse vs local-format offset well
// away from a month boundary so these don't flake by timezone.
describe('formatMonth', () => {
  it('formats month + year', () => {
    expect(formatMonth('2024-03-15')).toBe('March 2024')
  })

  it('returns "" for nullish', () => {
    expect(formatMonth()).toBe('')
    expect(formatMonth(null)).toBe('')
  })
})

describe('dateRange', () => {
  it('uses Present for a current role', () => {
    expect(dateRange({ startDate: '2022-01-10', endDate: null, current: true })).toBe(
      'January 2022 – Present',
    )
  })

  it('formats start – end', () => {
    expect(dateRange({ startDate: '2022-01-10', endDate: '2023-06-10', current: false })).toBe(
      'January 2022 – June 2023',
    )
  })
})

describe('yearRange', () => {
  it('renders year granularity, Present when current', () => {
    expect(yearRange({ startDate: '2018-05-10', endDate: null, current: true })).toBe('2018 - Present')
    expect(yearRange({ startDate: '2018-05-10', endDate: '2021-09-10', current: false })).toBe(
      '2018 - 2021',
    )
  })
})
