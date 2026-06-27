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

// varClass = STATIC Tailwind arbitrary-property classes (the scanner needs the
// literals) setting --node to the stock *-500 token (loud — node fill, selected
// chip) and --node-soft to the *-200 token (quiet — chip label at rest).
export const CATEGORIES: CategoryMeta[] = [
  { key: 'engineering', label: 'Engineering', varClass: '[--node:var(--color-red-500)] [--node-soft:var(--color-red-200)]' },
  { key: 'ai', label: 'AI', varClass: '[--node:var(--color-orange-500)] [--node-soft:var(--color-orange-200)]' },
  { key: 'portfolio', label: 'Portfolio', varClass: '[--node:var(--color-amber-500)] [--node-soft:var(--color-amber-200)]' },
  { key: 'product', label: 'Product', varClass: '[--node:var(--color-yellow-500)] [--node-soft:var(--color-yellow-200)]' },
  { key: 'artist', label: 'Artist', varClass: '[--node:var(--color-green-500)] [--node-soft:var(--color-green-200)]' },
  { key: 'film', label: 'Film', varClass: '[--node:var(--color-emerald-500)] [--node-soft:var(--color-emerald-200)]' },
  { key: 'game', label: 'Game', varClass: '[--node:var(--color-teal-500)] [--node-soft:var(--color-teal-200)]' },
  { key: 'music', label: 'Music', varClass: '[--node:var(--color-cyan-500)] [--node-soft:var(--color-cyan-200)]' },
  { key: 'genre', label: 'Genre', varClass: '[--node:var(--color-sky-500)] [--node-soft:var(--color-sky-200)]' },
  { key: 'human_experience', label: 'Human experience', varClass: '[--node:var(--color-blue-500)] [--node-soft:var(--color-blue-200)]' },
  { key: 'philosophy', label: 'Philosophy', varClass: '[--node:var(--color-indigo-500)] [--node-soft:var(--color-indigo-200)]' },
  { key: 'core_concept', label: 'Core concept', varClass: '[--node:var(--color-violet-500)] [--node-soft:var(--color-violet-200)]' },
  { key: 'fringe', label: 'Fringe', varClass: '[--node:var(--color-purple-500)] [--node-soft:var(--color-purple-200)]' },
]

const BY_KEY = new Map(CATEGORIES.map((c) => [c.key, c]))
const FALLBACK: CategoryMeta = {
  key: 'other',
  label: 'Other',
  varClass: '[--node:var(--color-slate-400)] [--node-soft:var(--color-slate-200)]',
}

export function categoryMeta(key: string): CategoryMeta {
  return BY_KEY.get(key) ?? FALLBACK
}
