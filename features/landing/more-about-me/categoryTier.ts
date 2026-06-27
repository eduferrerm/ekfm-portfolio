/**
 * Folds the 13 raw node categories into the three brand tiers that drive node
 * colour on the mental graph (the "group into brand tiers" decision):
 *
 *   primary (lime)     — work / tech       engineering · ai · portfolio · product
 *   secondary (blue)   — culture & taste   artist · film · music · genre · game
 *   tertiary (fuchsia) — mind & self       core_concept · philosophy · human_experience · fringe
 *
 * Kept separate from the data so the brand decision lives in code (not baked into
 * graph.json), and so a later category/tier FILTER UI can read the same map. An
 * unknown category falls back to `tertiary` rather than throwing.
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

/**
 * Node chip classes per tier — semantic tokens only (lime `--primary`, blue
 * `--selection`, fuchsia `--accent`), tinted fill + solid border + on-tier text.
 */
export const TIER_NODE: Record<Tier, string> = {
  primary: 'border-primary bg-primary/15 text-primary',
  secondary: 'border-selection bg-selection/15 text-selection',
  tertiary: 'border-accent bg-accent/15 text-accent',
}

/** On-tier text colour (lime / blue / fuchsia) — for the hover panel + legend. */
export const TIER_TEXT: Record<Tier, string> = {
  primary: 'text-primary',
  secondary: 'text-selection',
  tertiary: 'text-accent',
}

/** Human label for each tier — for a legend / future filter control. */
export const TIER_LABEL: Record<Tier, string> = {
  primary: 'Work & tech',
  secondary: 'Culture & taste',
  tertiary: 'Mind & self',
}
