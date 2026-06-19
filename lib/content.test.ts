import { describe, expect, it } from 'vitest'

import type { Experience, Portfolio } from '@/payload-types'

import { type ContentRef, resolveContentRefs } from './content'

const portfolio = (slug: string | null) => ({ slug, eyebrow: 'E' }) as unknown as Portfolio
const experience = (slug: string | null) =>
  ({ slug, company: 'C', role: 'R' }) as unknown as Experience

describe('resolveContentRefs', () => {
  it('resolves populated refs to doc + href, preserving order and discriminant', () => {
    const refs: ContentRef[] = [
      { relationTo: 'portfolio', value: portfolio('p1') },
      { relationTo: 'experience', value: experience('e1') },
    ]
    expect(resolveContentRefs(refs)).toEqual([
      { relationTo: 'portfolio', doc: refs[0].value, href: '/portfolio/p1' },
      { relationTo: 'experience', doc: refs[1].value, href: '/experience/e1' },
    ])
  })

  it('skips unpopulated ids and slug-less docs', () => {
    const refs: ContentRef[] = [
      { relationTo: 'portfolio', value: 7 },
      { relationTo: 'experience', value: experience(null) },
      { relationTo: 'portfolio', value: portfolio('keep') },
    ]
    expect(resolveContentRefs(refs).map((r) => r.href)).toEqual(['/portfolio/keep'])
  })

  it('handles nullish input', () => {
    expect(resolveContentRefs()).toEqual([])
    expect(resolveContentRefs(null)).toEqual([])
  })
})
