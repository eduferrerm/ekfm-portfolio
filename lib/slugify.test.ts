import { describe, expect, it } from 'vitest'

import { slugify } from './slugify'

describe('slugify', () => {
  it('lowercases and dashes non-alphanumerics', () => {
    expect(slugify('More About Me')).toBe('more-about-me')
    expect(slugify('TL;DR')).toBe('tl-dr')
  })

  it('strips diacritics', () => {
    expect(slugify('Café Señor')).toBe('cafe-senor')
  })

  it('collapses runs and trims leading/trailing dashes', () => {
    expect(slugify('  --Hello   World!!  ')).toBe('hello-world')
  })
})
