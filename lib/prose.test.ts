import { describe, expect, it } from 'vitest'

import { proseLines } from './prose'

describe('proseLines', () => {
  it('keeps non-empty text rows in order', () => {
    expect(proseLines([{ text: 'a' }, { text: 'b' }])).toEqual(['a', 'b'])
  })

  it('drops empty and nullish rows', () => {
    expect(proseLines([{ text: '' }, { text: null }, { text: 'x' }, { text: undefined }])).toEqual([
      'x',
    ])
  })

  it('handles nullish input', () => {
    expect(proseLines()).toEqual([])
    expect(proseLines(null)).toEqual([])
  })
})
