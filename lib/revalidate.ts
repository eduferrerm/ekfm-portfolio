import { revalidatePath } from 'next/cache'

/**
 * Drop the entire route cache — the root layout and every nested segment, i.e.
 * the canonical pages AND every `/dear/[company]` mirror. Wired into the
 * `afterChange` hook of every content source (collections + globals) so a single
 * publish refreshes the whole tree instantly. On-demand revalidation is the
 * PRIMARY freshness mechanism; the per-route daily `revalidate` timer is only a
 * backstop for writes that never hit a request scope (see {@link warmVisitor}).
 *
 * The whole-tree blast radius is deliberate: the Landing + VisitorContent globals
 * fan out across both `/` and every mirror, so reasoning about which source feeds
 * which page is more error-prone than just refreshing everything. The site is
 * small and pages are cheap to regenerate, so the trade is worth the simplicity.
 *
 * Best-effort: `revalidatePath` only works inside a Next request scope, so a
 * write from a script (seed/migration) throws — swallow it. Those pages self-heal
 * on their next daily revalidate regardless.
 */
export function revalidateSite(): void {
  try {
    revalidatePath('/', 'layout')
  } catch {
    // Not in a request context (e.g. seed/migration) — ignore.
  }
}

/**
 * Pre-render a visitor's landing into the ISR cache right after publish, so a
 * brand-new or freshly-edited company is hot on the first recruiter click rather
 * than a cold on-demand render. This is what makes a company ADDED BETWEEN
 * DEPLOYS (not yet in `generateStaticParams`) fast on its very first hit.
 *
 * Pairs with {@link revalidateSite}: that call marks the tree stale, this fetch
 * regenerates + re-caches the one page that matters most. Best-effort and
 * time-boxed — if it misses (cold Railway, network hiccup), the page still
 * renders on demand on the first real request.
 */
export async function warmVisitor(slug: string): Promise<void> {
  const base = process.env.NEXT_PUBLIC_PAYLOAD_URL
  if (!base || !slug) return
  try {
    // A plain GET triggers the ISR render that fills the cache. Time-boxed so a
    // slow/cold render can't stall the admin save that triggered this hook.
    await fetch(`${base}/dear/${slug}`, { signal: AbortSignal.timeout(8000) })
  } catch {
    // Cold Railway / network hiccup / timeout — the page self-heals on demand.
  }
}
