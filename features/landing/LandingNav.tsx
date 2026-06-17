/**
 * Persistent landing nav. Anchors derive from the Landing global's section
 * `navLabel`s (slugified upstream), so the nav, the band ids, and the search
 * docs all stay in sync. Sticky; the reveal-on-scroll animation (hidden over the
 * hero) is deferred. The Search affordance is a placeholder — the palette is
 * Phase 6.
 */
export function LandingNav({ items }: { items: { label: string; slug: string }[] }) {
  return (
    <nav className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-6 px-6 py-3">
        <span className="rounded border border-primary px-2 py-0.5 text-sm font-bold tracking-widest text-primary">
          EKFM
        </span>
        <ul className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
          {items.map((item) => (
            <li key={item.slug}>
              <a
                href={`#${item.slug}`}
                className="uppercase tracking-wide text-muted-foreground transition hover:text-foreground"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
        <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
          Search
        </span>
      </div>
    </nav>
  )
}
