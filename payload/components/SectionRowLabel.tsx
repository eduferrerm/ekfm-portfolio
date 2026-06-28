'use client'

import React from 'react'
import { useRowLabel } from '@payloadcms/ui'

/**
 * Row label for the Landing `sections[]` array.
 *
 * Replaces Payload's default "Section 01 / 02 …" collapsed-row label with the
 * section's own `navLabel` (falling back to its `key`, then the numbered
 * default) so the editable nav spine is scannable at a glance in the admin.
 * Presentation-only — it reads the row's in-form data, never mutates it.
 */
export const SectionRowLabel: React.FC = () => {
  const { data, rowNumber } = useRowLabel<{ navLabel?: string; key?: string }>()
  const fallback = `Section ${String((rowNumber ?? 0) + 1).padStart(2, '0')}`
  return <span>{data?.navLabel || data?.key || fallback}</span>
}
