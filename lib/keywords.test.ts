import { describe, expect, it } from 'vitest'

import type { Keyword } from '@/payload-types'

import { keywordAliases, keywordLabels } from './keywords'

const kw = (label: string, aliases?: string[]): Keyword => ({
  id: 1,
  key: label.toLowerCase(),
  label,
  category: 'scope',
  aliases: aliases ?? null,
  updatedAt: '',
  createdAt: '',
})

describe('keywordLabels', () => {
  it('returns labels in attach order across groups', () => {
    expect(keywordLabels([kw('React'), kw('Node')], [kw('Testing')])).toEqual([
      'React',
      'Node',
      'Testing',
    ])
  })

  it('skips unpopulated ids and nullish groups', () => {
    expect(keywordLabels([1, kw('React'), 2], null, undefined)).toEqual(['React'])
  })

  it('returns [] with no args or all-empty groups', () => {
    expect(keywordLabels()).toEqual([])
    expect(keywordLabels(null, [])).toEqual([])
  })
})

describe('keywordAliases', () => {
  it('flattens aliases across groups, dropping keywords without any', () => {
    expect(
      keywordAliases([kw('React', ['jsx', 'hooks']), kw('Node')], [kw('Testing', ['tdd'])]),
    ).toEqual(['jsx', 'hooks', 'tdd'])
  })

  it('skips unpopulated ids', () => {
    expect(keywordAliases([1, kw('React', ['jsx'])])).toEqual(['jsx'])
  })
})
