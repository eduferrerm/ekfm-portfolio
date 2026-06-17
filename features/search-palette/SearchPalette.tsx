'use client'

import { ArrowLeft, Search, X } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { capture } from '@/lib/posthog/client'
import { AnalyticsEvent } from '@/lib/posthog/events'
import type { SearchDocument } from '@/lib/search/types'
import { cn } from '@/lib/utils'

import { ALL_FACET, COMPANY_FACET, applyFacet, buildFacets } from './facets'
import { SearchResultRow } from './SearchResultRow'
import { useRecentSearches } from './useRecentSearches'
import { useSearchIndex } from './useSearchIndex'
import type { VisitorSearchContext } from './types'

/** ~5min cache-warm debounce is irrelevant here; this just avoids per-keystroke events. */
const ANALYTICS_DEBOUNCE_MS = 350

/**
 * The site-wide search palette. Renders the nav trigger + a portaled overlay
 * (portaled to body because the nav's backdrop-blur would otherwise contain the
 * fixed overlay). Wires the static corpus into a client Fuse index, facets
 * results by doc type, persists recent searches, and — for visitors — seeds the
 * empty state from their per-expectation relevant content. Cmd/Ctrl+K toggles;
 * Esc closes; arrow keys + Enter drive the result list.
 */
export function SearchPalette({
  documents,
  visitorSearch,
  placeholder = 'Search',
}: {
  documents: SearchDocument[]
  visitorSearch?: VisitorSearchContext | null
  placeholder?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { search } = useSearchIndex(documents)
  const { recents, add, clear } = useRecentSearches()

  const defaultFacet = visitorSearch ? COMPANY_FACET : ALL_FACET
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [query, setQuery] = useState('')
  const [facet, setFacet] = useState(defaultFacet)
  const [activeIndex, setActiveIndex] = useState(0)

  const inputRef = useRef<HTMLInputElement>(null)
  const activeRowRef = useRef<HTMLButtonElement>(null)

  // createPortal needs document — only after mount.
  useEffect(() => setMounted(true), [])

  // Global toggle shortcut.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Focus on open; reset query/facet/selection on close so the next open is fresh.
  useEffect(() => {
    if (open) {
      inputRef.current?.focus()
      return
    }
    setQuery('')
    setFacet(defaultFacet)
    setActiveIndex(0)
  }, [open, defaultFacet])

  // Lock body scroll while open.
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  const trimmed = query.trim()
  const isQuerying = trimmed.length > 0
  const facets = useMemo(() => {
    const base = buildFacets(documents)
    return visitorSearch
      ? [{ key: COMPANY_FACET, label: visitorSearch.companyChipLabel }, ...base]
      : base
  }, [documents, visitorSearch])

  // hrefs of the visitor's relevant content — used to scope the Company facet.
  const companyHrefs = useMemo(
    () =>
      new Set((visitorSearch?.expectations ?? []).flatMap((g) => g.items.map((i) => i.href))),
    [visitorSearch],
  )

  const results = useMemo(() => {
    if (!isQuerying) return []
    const raw = search(query)
    if (facet === COMPANY_FACET) return raw.filter((d) => companyHrefs.has(d.href))
    return applyFacet(raw, facet)
  }, [isQuerying, search, query, facet, companyHrefs])

  // Keep the active row in range and scrolled into view.
  useEffect(() => {
    setActiveIndex((i) => Math.min(i, Math.max(results.length - 1, 0)))
  }, [results.length])
  useEffect(() => {
    activeRowRef.current?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  // Debounced search analytics.
  useEffect(() => {
    if (!isQuerying) return
    const t = setTimeout(() => {
      capture(AnalyticsEvent.SearchPerformed, { query: trimmed, resultCount: results.length })
    }, ANALYTICS_DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [trimmed, isQuerying, results.length])

  const close = useCallback(() => setOpen(false), [])

  const selectRow = useCallback(
    (row: { id?: string; href: string }, rank: number) => {
      capture(AnalyticsEvent.SearchResultSelected, {
        query: trimmed,
        resultId: row.id ?? row.href,
        rank,
      })
      if (trimmed) add(trimmed)
      setOpen(false)
      // Section docs ship a bare `#slug` fragment so they resolve against the
      // current route (a visitor stays on /dear/[company]); absolute hrefs
      // (portfolio/experience detail pages) navigate as-is.
      router.push(row.href.startsWith('#') ? `${pathname}${row.href}` : row.href)
    },
    [trimmed, add, router, pathname],
  )

  const runRecent = useCallback((q: string) => {
    setQuery(q)
    setActiveIndex(0)
    inputRef.current?.focus()
  }, [])

  const onPanelKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      close()
      return
    }
    if (!isQuerying || results.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      const row = results[activeIndex]
      if (row) selectRow(row, activeIndex)
    }
  }

  const showChips = isQuerying || Boolean(visitorSearch)
  const showExpectations = !isQuerying && Boolean(visitorSearch)

  const overlay = (
    <div className="fixed inset-0 z-[60]">
      <button
        type="button"
        aria-label="Close search"
        onClick={close}
        className="absolute inset-0 cursor-default bg-background/70 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        onKeyDown={onPanelKeyDown}
        className="absolute inset-x-3 top-3 mx-auto flex max-h-[calc(100vh-1.5rem)] max-w-lg flex-col overflow-hidden rounded-xl border border-border bg-card p-4 shadow-2xl sm:inset-x-auto sm:right-6 sm:top-16 sm:w-[28rem]"
      >
        {/* Mobile-only back / close (desktop closes via backdrop or Esc). */}
        <div className="mb-3 flex items-center justify-between sm:hidden">
          <button type="button" onClick={close} aria-label="Back" className="text-muted-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button type="button" onClick={close} aria-label="Close" className="text-muted-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActiveIndex(0)
            }}
            placeholder={placeholder}
            aria-label="Search query"
            className="w-full rounded-lg border border-border bg-muted/40 py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>

        {showChips && (
          <div className="mt-3 flex flex-wrap gap-2">
            {facets.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => {
                  setFacet(f.key)
                  setActiveIndex(0)
                }}
                aria-pressed={facet === f.key}
                className={cn(
                  'rounded-md border px-2.5 py-1 text-xs transition',
                  facet === f.key
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border text-muted-foreground hover:text-foreground',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        <div className="mt-3 flex-1 overflow-y-auto">
          {isQuerying && (
            <div>
              <p className="px-2 text-sm font-medium text-primary">Results</p>
              {results.length === 0 ? (
                <p className="px-2 py-6 text-sm text-muted-foreground">
                  No results for “{trimmed}”.
                </p>
              ) : (
                <div className="mt-1 grid grid-cols-1 gap-1 sm:grid-cols-2">
                  {results.map((doc, i) => (
                    <SearchResultRow
                      key={doc.id}
                      ref={i === activeIndex ? activeRowRef : undefined}
                      row={doc}
                      active={i === activeIndex}
                      onMouseEnter={() => setActiveIndex(i)}
                      onSelect={() => selectRow(doc, i)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {showExpectations &&
            visitorSearch!.expectations.map((group) => (
              <div key={group.title} className="mt-4 first:mt-0">
                <p className="px-2 text-sm font-medium text-primary">{group.title}</p>
                <p className="px-2 text-xs text-muted-foreground line-clamp-2">{group.summary}</p>
                <div className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2">
                  {group.items.map((item, i) => (
                    <SearchResultRow
                      key={`${group.title}:${item.href}`}
                      row={item}
                      onSelect={() => selectRow(item, i)}
                    />
                  ))}
                </div>
              </div>
            ))}

          {recents.length > 0 && (
            <div className="mt-4 border-t border-border pt-3">
              <div className="flex items-center justify-between px-2">
                <span className="text-sm font-medium text-primary">Recent Searches</span>
                <button
                  type="button"
                  onClick={clear}
                  className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                >
                  Clear
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2 px-2">
                {recents.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => runRecent(r)}
                    className="rounded-md px-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open search"
        aria-keyshortcuts="Meta+K Control+K"
        className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition hover:text-foreground"
      >
        <Search className="h-3.5 w-3.5" />
        Search
      </button>
      {mounted && open && createPortal(overlay, document.body)}
    </>
  )
}
