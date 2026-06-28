'use client'

import React from 'react'

/**
 * List-view Cell for the Keywords `label` column.
 *
 * Prefixes "SO:" on rows whose `category` is `searchOnly`, so hidden recruiter
 * terms are visually distinct in the admin list. This is presentation-only — it
 * does not touch the stored `label`, and the relationship pickers' typeahead
 * reads `label` via `useAsTitle` (not this Cell), so the prefix never leaks into
 * the scope/craft/searchKeywords pickers.
 */
type KeywordLabelCellProps = {
  cellData?: unknown
  rowData?: { category?: string }
}

export const KeywordLabelCell: React.FC<KeywordLabelCellProps> = ({ cellData, rowData }) => {
  const label = typeof cellData === 'string' ? cellData : ''
  const prefix = rowData?.category === 'searchOnly' ? 'SO: ' : ''
  return (
    <span>
      {prefix}
      {label}
    </span>
  )
}
