'use client'

import { Search, X } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { Brand } from '@/components/Brand'
import { Container } from '@/components/Container'
import { Pressable } from '@/components/primitives/Pressable'
import { tagVariants } from '@/components/primitives/Tag'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { capture } from '@/lib/posthog/client'
import { AnalyticsEvent } from '@/lib/posthog/events'
import { scopeFromPath, scopeHref } from '@/lib/routes'
import type { SearchDocument } from '@/lib/search/types'
import { cn } from '@/lib/utils'

import { MetaCard } from '@/components/primitives/MetaCard'

import { ALL_FACET, COMPANY_FACET, applyFacet, buildFacets } from './facets'
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
  overlayAlign = 'edge',
  enableGlobalShortcut = true,
}: {
  documents: SearchDocument[]
  visitorSearch?: VisitorSearchContext | null
  placeholder?: string
  /**
   * Where the portaled overlay anchors. 'container' aligns it to the shared
   * content column (<Container>) so it sits under a Search trigger that lives in
   * that column (the landing nav, the inner-page top bar). 'edge' pins it to the
   * viewport edge for a trigger that sits at the edge.
   */
  overlayAlign?: 'container' | 'edge'
  /**
   * Whether this instance binds the global Cmd/Ctrl+K toggle. Below md the trigger
   * is duplicated — one in the top bar, one inside the hamburger drawer — so only
   * the always-mounted bar instance owns the shortcut; the drawer twin passes
   * false so a keypress doesn't toggle both overlays at once.
   */
  enableGlobalShortcut?: boolean
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
  const resultsGridRef = useRef<HTMLDivElement>(null)

  // createPortal needs document — only after mount.
  useEffect(() => setMounted(true), [])

  // Global toggle shortcut (only the bar instance binds it — see enableGlobalShortcut).
  useEffect(() => {
    if (!enableGlobalShortcut) return
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [enableGlobalShortcut])

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

  // The Company facet is an empty-state affordance, not a search scope: it shows
  // the curated relevant-content list while the input is empty. The moment the
  // visitor starts typing, flip to All (a real corpus search over everything);
  // clearing the input returns to the Company empty state. The effect only fires
  // on the empty↔typing transition, so a manual facet pick mid-query still sticks.
  useEffect(() => {
    if (!visitorSearch) return
    setFacet(isQuerying ? ALL_FACET : COMPANY_FACET)
  }, [isQuerying, visitorSearch])

  const results = useMemo(() => {
    if (!isQuerying) return []
    return applyFacet(search(query), facet)
  }, [isQuerying, search, query, facet])

  // Latest results for the debounced analytics effect to read without making the
  // full array a dependency (the effect intentionally fires on count change).
  const resultsRef = useRef(results)
  resultsRef.current = results

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
      capture(AnalyticsEvent.SearchPerformed, {
        query: trimmed,
        resultCount: results.length,
        // Top few ids the term surfaced — answers "what results did this query produce".
        resultIds: resultsRef.current.slice(0, 5).map((r) => r.id),
      })
    }, ANALYTICS_DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [trimmed, isQuerying, results.length])

  const close = useCallback(() => setOpen(false), [])

  const selectRow = useCallback(
    (row: { id?: string; href: string; type?: string; name?: string }, rank: number) => {
      capture(AnalyticsEvent.SearchResultSelected, {
        query: trimmed,
        resultId: row.id ?? row.href,
        rank,
        resultType: row.type,
        resultName: row.name,
      })
      if (trimmed) add(trimmed)
      setOpen(false)
      // All result hrefs are root-relative; scope them to the current mirror (if
      // any) so a visitor never breaks out of /dear/[company]. Section anchors
      // (`/#slug`) thus resolve to the mirror's landing — not appended to the
      // current route, which would be a dead fragment on an inner page.
      router.push(scopeHref(row.href, scopeFromPath(pathname)))
    },
    [trimmed, add, router, pathname],
  )

  const runRecent = useCallback((q: string) => {
    setQuery(q)
    setActiveIndex(0)
    inputRef.current?.focus()
  }, [])

  // Results render as a responsive grid (1 col on mobile, 2 at sm+), so the flat
  // activeIndex maps to a 2D layout. Measure the live column count by grouping
  // the rendered cards by offsetTop — robust across the breakpoint and any future
  // column change, unlike hard-coding the `sm` width. Up/Down then step a full
  // row (±columns) and Left/Right step within a row (±1), all clamped to bounds.
  const getColumns = useCallback(() => {
    const cards = resultsGridRef.current?.children
    if (!cards || cards.length < 2) return 1
    const firstTop = (cards[0] as HTMLElement).offsetTop
    let cols = 1
    for (let i = 1; i < cards.length; i++) {
      if ((cards[i] as HTMLElement).offsetTop !== firstTop) break
      cols++
    }
    return cols
  }, [])

  const onPanelKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      close()
      return
    }
    if (!isQuerying || results.length === 0) return
    const last = results.length - 1
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + getColumns(), last))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - getColumns(), 0))
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, last))
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      const row = results[activeIndex]
      if (row) selectRow(row, activeIndex)
    }
  }

  const showChips = isQuerying || Boolean(visitorSearch)
  const showExpectations = !isQuerying && Boolean(visitorSearch)

  const panelBody = (
    <>
      {/* Top group: the input + facet chips share one hairline-bordered frame,
          fixed above the scrolling content (per the board's nested panel). */}
      <div className="border-t-rounded-lg bg-sunken p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActiveIndex(0)
            }}
            placeholder={placeholder}
            aria-label="Search query"
            className="pl-9 pr-3 "
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
                  // The interactive consumer of Tag: selected fills lime (the
                  // toggled-on affordance); unselected is an OUTLINE chip per the
                  // board (transparent fill, not Tag's default grey), growing a
                  // lime edge on hover.
                  tagVariants({ selected: facet === f.key }),
                  'cursor-pointer',
                  facet !== f.key && 'bg-transparent hover:border-primary hover:text-foreground',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Scrolling content. Corpus search → one Results card; a visitor empty
          state → one card per expectation; recents → a lighter footer band. */}
      <div className="flex flex-1 flex-col overflow-y-auto">
        <div className={cn('flex flex-col bg-muted', (isQuerying || showExpectations) && 'p-2')}>
          {isQuerying && (
            <Card className="rounded-xl border-border p-4 bg-sunken">
              <p className="text-lead text-label">Results</p>
              {results.length === 0 ? (
                <p className="mt-2 text-body text-muted-foreground">No results for “{trimmed}”.</p>
              ) : (
                <div ref={resultsGridRef} className="mt-3 grid grid-cols-1 gap-1 sm:grid-cols-2">
                  {results.map((doc, i) => (
                    <MetaCard
                      key={doc.id}
                      ref={i === activeIndex ? activeRowRef : undefined}
                      eyebrow={doc.label}
                      title={doc.name}
                      thumbnail={doc.thumbnail}
                      active={i === activeIndex}
                      onMouseEnter={() => setActiveIndex(i)}
                      onSelect={() => selectRow(doc, i)}
                    />
                  ))}
                </div>
              )}
            </Card>
          )}
          {showExpectations &&
            visitorSearch!.expectations.map((group, idx, arr) => (
              <Card
                key={group.title}
                className={cn(
                  'rounded-xl border-border p-4 bg-sunken',
                  idx !== arr.length - 1 && 'mb-2',
                )}
              >
                <p className="text-lead text-label">{group.title}</p>
                <p className="mt-1 text-body text-muted-foreground line-clamp-2">{group.summary}</p>
                <div className="mt-3 grid grid-cols-1 gap-1 sm:grid-cols-2">
                  {group.items.map((item, i) => (
                    <MetaCard
                      key={`${group.title}:${item.href}`}
                      eyebrow={item.label}
                      title={item.name}
                      thumbnail={item.thumbnail}
                      onSelect={() => selectRow(item, i)}
                    />
                  ))}
                </div>
              </Card>
            ))}
        </div>

        {recents.length > 0 && (
          <div className="bg-muted/30 p-4 py-6">
            <div className="flex items-center justify-between">
              <span className="text-lead text-label pb-2">Recent Searches</span>
              {/* Board shows Clear as an underlined text link, not a pill. */}
              <button
                type="button"
                onClick={clear}
                className="text-ui text-foreground underline underline-offset-2 transition hover:text-muted-foreground"
              >
                Clear
              </button>
            </div>
            {/* Recents are plain muted text labels (no pill), per the board. */}
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {recents.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => runRecent(r)}
                  className="text-ui text-muted-foreground transition hover:text-foreground"
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )

  // The dialog itself; positioning lives on the alignment wrapper in `overlay`
  // so the same panel can sit in the content column (landing nav) or at the
  // viewport edge (full-bleed section header).
  const dialog = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search"
      onKeyDown={onPanelKeyDown}
      className="pointer-events-auto flex max-h-[60vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-xl sm:w-120"
    >
      {panelBody}
    </div>
  )

  const overlay = (
    <div className="fixed inset-0 z-60">
      <button
        type="button"
        aria-label="Close search"
        onClick={close}
        className="absolute inset-0 cursor-default bg-background/70 backdrop-blur-sm"
      />
      {/* Mobile close bar — sits ABOVE the palette and mirrors the MenuOverlay top
          row exactly (same Container column + --header-h baseline): brand on the
          left, a lime ghost X on the right. Desktop closes via backdrop / Esc, so
          this is sm:hidden. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 sm:hidden">
        <Container className="pointer-events-auto flex h-(--header-h) items-center justify-between">
          <Brand href="/" />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={close}
            aria-label="Close search"
            className="text-primary"
          >
            <X className="h-6 w-6" />
          </Button>
        </Container>
      </div>
      {/* The alignment wrapper is click-through (pointer-events-none) so an
          outside click still reaches the backdrop; only the dialog itself
          catches events. 'container' aligns the panel to the content column,
          under the nav's Search button; 'edge' pins it to the viewport edge.
          On mobile the panel drops below the close bar (top = --header-h). */}
      {overlayAlign === 'container' ? (
        <div className="pointer-events-none absolute inset-x-0 top-(--header-h) sm:top-16">
          <Container className="flex justify-end">{dialog}</Container>
        </div>
      ) : (
        <div className="pointer-events-none absolute inset-x-3 top-(--header-h) flex justify-center sm:inset-x-auto sm:right-6 sm:top-16 sm:block">
          {dialog}
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* A one-off: a bespoke skin (tag-style border, dark fill, lime glyph) with
          a leading Search glyph and no chevron. Rather than register a `variant`
          it'd be the only member of, it's composed straight from the Pressable
          mechanism — the payoff of the primitive: arbitrary styles, no variant. */}
      <Pressable
        type="button"
        className="rounded-full border border-border-tag bg-sunken px-5 py-3 text-muted-foreground hover:border-primary hover:text-primary active:border-primary active:bg-primary active:text-primary-foreground"
        startIcon={<Search className="h-5 w-5 text-primary" />}
        onClick={() => setOpen(true)}
        aria-label="Open search"
        aria-keyshortcuts="Meta+K Control+K"
      >
        {/* Eyebrow type role on the label element — a flex item, so the optical
            `-mb` nudge applies; a <span> keeps the button's content phrasing-only. */}
        <span className="mb-[-2px] text-nav">Search</span>
      </Pressable>
      {mounted && open && createPortal(overlay, document.body)}
    </>
  )
}
