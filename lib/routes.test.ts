import { describe, expect, it } from 'vitest'

import { experienceHref, portfolioHref } from './routes'

describe('routes', () => {
  it('builds slugged hrefs', () => {
    expect(portfolioHref('a')).toBe('/portfolio/a')
    expect(experienceHref('b')).toBe('/experience/b')
  })

  it('falls back to the collection index when the slug is missing', () => {
    expect(portfolioHref()).toBe('/portfolio')
    expect(portfolioHref(null)).toBe('/portfolio')
    expect(experienceHref('')).toBe('/experience')
  })
})
