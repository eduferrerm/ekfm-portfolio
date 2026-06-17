'use client'

import Image from 'next/image'
import { forwardRef } from 'react'

import { cn } from '@/lib/utils'

import type { ResultRow } from './types'

/**
 * One result row: a thumbnail (or a neutral placeholder) + a small category
 * eyebrow over the bold name. Used both for corpus search results and for the
 * visitor empty-state relevant-content items, so they look identical. Rendered
 * as a button — the palette owns navigation + analytics on select.
 */
export const SearchResultRow = forwardRef<
  HTMLButtonElement,
  {
    row: ResultRow
    active?: boolean
    onSelect: () => void
    onMouseEnter?: () => void
  }
>(function SearchResultRow({ row, active = false, onSelect, onMouseEnter }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onSelect}
      onMouseEnter={onMouseEnter}
      data-active={active}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition',
        active ? 'bg-muted' : 'hover:bg-muted/60',
      )}
    >
      <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
        {row.thumbnail ? (
          <Image src={row.thumbnail} alt="" fill sizes="36px" className="object-cover" />
        ) : (
          <span
            aria-hidden
            className="flex h-full w-full items-center justify-center text-xs font-semibold text-muted-foreground"
          >
            {row.name.charAt(0).toUpperCase()}
          </span>
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs uppercase tracking-wide text-muted-foreground">
          {row.label}
        </span>
        <span className="block truncate text-sm font-medium text-foreground">{row.name}</span>
      </span>
    </button>
  )
})
