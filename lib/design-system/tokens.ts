/**
 * The design system as a route-agnostic CATALOG — names, grouping, and order
 * only. It deliberately holds **no values**: every colour and type spec is read
 * live from `app/globals.css` at runtime via `resolveTokens.ts`, so this file
 * can never drift from the SSOT the way a hand-copied `slate-900` literal can.
 *
 * `globals.css` (`@theme` + `@utility`) is the value SSOT. This is the curated
 * description of what it contains — which `@theme` tokens exist, in which
 * foundation, in what order — knowledge that isn't encodable in the CSS itself.
 *
 * Consumed by the `(dev)/design-system` viewer today; reusable by any future
 * consumer (a public docs page, a visual-regression test) since it lives in lib.
 */

/** The shape of one colour/state/palette token in the catalog. No value — only
 *  the pointers needed to paint a chip (`swatch`) and resolve it (`cssVar`). */
export type DSThemeColor = {
  /** Display label + identity, e.g. `background`, `lime / 200`. */
  name: string
  /** The custom property to resolve a value/provenance from, e.g. `--background`. */
  cssVar: string
  /** The Tailwind utility that paints the swatch chip, e.g. `bg-background`. */
  swatch: string
  /** Swatch is light enough to need a light label drawn over it. */
  dark?: boolean
}

/** A foundation: a titled, ordered group of colour tokens. `caption` picks what
 *  the viewer reads off each token — the `var()` provenance (which stock stop a
 *  role maps to) or the resolved colour value (for raw palette stops). */
export type DSThemeColorGroup = {
  id: string
  title: string
  caption: 'provenance' | 'value'
  tokens: DSThemeColor[]
}

/** The shape of one type role in the catalog. The spec (family/weight/size/…) is
 *  read live off the rendered sample — never restated here. */
export type DSThemeTextStyle = {
  /** The `@utility text-*` class name. */
  utility: string
  /** Override the default pangram (the hero headline uses a short sample). */
  sample?: string
  /** Render in its own emphasised row above the scale (hero headline). */
  feature?: boolean
}

// ── Foundations · colour ──────────────────────────────────────────────────────
// Order and grouping are editorial; values live in globals.css Tier 1–2.

/** Tier 2 semantic roles — token → the stock stop it points at (provenance). */
const roles: DSThemeColor[] = [
  { name: 'background', cssVar: '--background', swatch: 'bg-background' },
  { name: 'foreground', cssVar: '--foreground', swatch: 'bg-foreground', dark: true },
  { name: 'card', cssVar: '--card', swatch: 'bg-card' },
  {
    name: 'card-foreground',
    cssVar: '--card-foreground',
    swatch: 'bg-card-foreground',
    dark: true,
  },
  { name: 'muted', cssVar: '--muted', swatch: 'bg-muted' },
  {
    name: 'muted-foreground',
    cssVar: '--muted-foreground',
    swatch: 'bg-muted-foreground',
    dark: true,
  },
  { name: 'border', cssVar: '--border', swatch: 'bg-border' },
  { name: 'input', cssVar: '--input', swatch: 'bg-input' },
  { name: 'primary', cssVar: '--primary', swatch: 'bg-primary', dark: true },
  { name: 'primary-foreground', cssVar: '--primary-foreground', swatch: 'bg-primary-foreground' },
  { name: 'accent', cssVar: '--accent', swatch: 'bg-accent', dark: true },
  { name: 'accent-foreground', cssVar: '--accent-foreground', swatch: 'bg-accent-foreground' },
  { name: 'ring', cssVar: '--ring', swatch: 'bg-ring', dark: true },
  { name: 'label', cssVar: '--label', swatch: 'bg-label', dark: true },
]

/** Tier 2 interaction-state tokens (+ the overlay wash). `label` is NOT here — it's
 *  a persistent text-colour role, not a state, so it lives in `roles`. */
const states: DSThemeColor[] = [
  { name: 'selection', cssVar: '--selection', swatch: 'bg-selection', dark: true },
  { name: 'feedback', cssVar: '--feedback', swatch: 'bg-feedback', dark: true },
  { name: 'overlay', cssVar: '--overlay', swatch: 'bg-overlay' },
]

/** Tier 1 raw palette primitives — the stock stops + alpha tints + gradient the
 *  brand Colors sheet names. Caption shows the resolved colour (the name is the
 *  stop already). */
const palette: DSThemeColor[] = [
  { name: 'lime / 200', cssVar: '--color-lime-200', swatch: 'bg-lime-200', dark: true },
  { name: 'lime / 200 / 20', cssVar: '--color-lime-200-20', swatch: 'bg-lime-200-20' },
  { name: 'fuchsia / 300', cssVar: '--color-fuchsia-300', swatch: 'bg-fuchsia-300', dark: true },
  { name: 'blue / 400', cssVar: '--color-blue-400', swatch: 'bg-blue-400', dark: true },
  { name: 'blue / 400 / 20', cssVar: '--color-blue-400-20', swatch: 'bg-blue-400-20' },
  { name: 'slate / 900', cssVar: '--color-slate-900', swatch: 'bg-slate-900' },
  { name: 'slate / 900 / 50', cssVar: '--color-slate-900-50', swatch: 'bg-slate-900-50' },
  { name: 'slate / 800', cssVar: '--color-slate-800', swatch: 'bg-slate-800' },
  { name: 'slate / 700', cssVar: '--color-slate-700', swatch: 'bg-slate-700' },
  { name: 'slate / 600', cssVar: '--color-slate-600', swatch: 'bg-slate-600' },
  { name: 'slate / 400', cssVar: '--color-slate-400', swatch: 'bg-slate-400', dark: true },
  { name: 'slate / 300', cssVar: '--color-slate-300', swatch: 'bg-slate-300', dark: true },
  { name: 'gradient', cssVar: '--gradient-surface', swatch: 'bg-gradient-surface' },
]

/** The colour foundations, in viewer order. */
export const dsThemeColors: DSThemeColorGroup[] = [
  { id: 'roles', title: 'Color roles · semantic', caption: 'provenance', tokens: roles },
  { id: 'states', title: 'State tokens', caption: 'provenance', tokens: states },
  { id: 'palette', title: 'Palette · primitives', caption: 'value', tokens: palette },
]

// ── Foundations · typography ──────────────────────────────────────────────────

/** The type scale (Tier 4 `@utility text-*`). Hero headline leads in its own row;
 *  the rest follow. Specs are read live off the DOM — see `resolveTokens`. */
export const dsThemeTextStyles: DSThemeTextStyle[] = [
  { utility: 'text-hero-headline', sample: 'headline', feature: true },
  { utility: 'text-header' },
  { utility: 'text-subtitle' },
  { utility: 'text-subheader' },
  { utility: 'text-lead' },
  { utility: 'text-body' },
  { utility: 'text-list' },
  { utility: 'text-eyebrow' },
  { utility: 'text-hero-list' },
  { utility: 'text-aside' },
  { utility: 'text-nav' },
  { utility: 'text-ui' },
  { utility: 'text-ui-bold' },
  { utility: 'text-card-title' },
  { utility: 'text-card-body' },
  { utility: 'text-meta' },
  { utility: 'text-meta-bold' },
]
