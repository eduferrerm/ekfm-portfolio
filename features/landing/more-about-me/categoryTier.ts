/**
 * Colour + grouping for the mental-graph's 13 node categories.
 *
 * Two layers:
 *  - TIER (3 brand tiers) — the coarse grouping, kept for a future tier filter and
 *    as documentation of how the categories relate.
 *  - CATEGORY colour (this is what nodes are painted by) — a 13-colour categorical
 *    viz scale, each a Tailwind `*-500` token (owner's choice: per-category detail
 *    over the coarse 3-hue brand). Each category's `varClass` sets the node's
 *    `--node` CSS var to that token's colour var, so the node's rest + hover styling
 *    and the legend swatch all read one value (`var(--node)`). Ordered
 *    work → culture → mind, so the spectrum still loosely tracks the tiers
 *    (warm → green/cyan → blue/purple).
 */
export type Tier = 'primary' | 'secondary' | 'tertiary'

const CATEGORY_TIER: Record<string, Tier> = {
  engineering: 'primary',
  ai: 'primary',
  portfolio: 'primary',
  product: 'primary',
  artist: 'secondary',
  film: 'secondary',
  music: 'secondary',
  genre: 'secondary',
  game: 'secondary',
  core_concept: 'tertiary',
  philosophy: 'tertiary',
  human_experience: 'tertiary',
  fringe: 'tertiary',
}

export function tierOf(category: string): Tier {
  return CATEGORY_TIER[category] ?? 'tertiary'
}

export type CategoryMeta = { key: string; label: string; varClass: string }

// varClass = a STATIC Tailwind arbitrary-property class (the scanner needs the
// literal) that points --node at a stock Tailwind *-500 colour var.
export const CATEGORIES: CategoryMeta[] = [
  { key: 'engineering', label: 'Engineering', varClass: '[--node:var(--color-red-500)]' },
  { key: 'ai', label: 'AI', varClass: '[--node:var(--color-orange-500)]' },
  { key: 'portfolio', label: 'Portfolio', varClass: '[--node:var(--color-amber-500)]' },
  { key: 'product', label: 'Product', varClass: '[--node:var(--color-yellow-500)]' },
  { key: 'artist', label: 'Artist', varClass: '[--node:var(--color-green-500)]' },
  { key: 'film', label: 'Film', varClass: '[--node:var(--color-emerald-500)]' },
  { key: 'game', label: 'Game', varClass: '[--node:var(--color-teal-500)]' },
  { key: 'music', label: 'Music', varClass: '[--node:var(--color-cyan-500)]' },
  { key: 'genre', label: 'Genre', varClass: '[--node:var(--color-sky-500)]' },
  { key: 'human_experience', label: 'Human experience', varClass: '[--node:var(--color-blue-500)]' },
  { key: 'philosophy', label: 'Philosophy', varClass: '[--node:var(--color-indigo-500)]' },
  { key: 'core_concept', label: 'Core concept', varClass: '[--node:var(--color-violet-500)]' },
  { key: 'fringe', label: 'Fringe', varClass: '[--node:var(--color-purple-500)]' },
]

const BY_KEY = new Map(CATEGORIES.map((c) => [c.key, c]))
const FALLBACK: CategoryMeta = { key: 'other', label: 'Other', varClass: '[--node:var(--color-slate-400)]' }

export function categoryMeta(key: string): CategoryMeta {
  return BY_KEY.get(key) ?? FALLBACK
}
