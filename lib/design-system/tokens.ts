/**
 * The design-system catalog. `app/globals.css` is the value SSOT, and most of this
 * is now GENERATED from it — `scripts/generate-tokens.mts` scrapes the colour
 * roles/states and the type-scale list into `tokens.generated.ts`, so a token is
 * authored once (in CSS) and never re-typed here.
 *
 * This hand file holds only what can't be scraped:
 *   - the token shape types, and
 *   - the `palette` foundation — curated stock Tailwind stops that live in Tailwind,
 *     not in globals.css, so there's nothing to read.
 *
 * Consumers import from here, not from the generated file: `dsThemeColors` (viewer),
 * `dsThemeTextStyles` (viewer), `textRoleNames` (cn()'s twMerge config).
 */
import { dsThemeTextStyles, generatedColorGroups } from './tokens.generated'

/** One colour token. No value — only the pointers to paint a chip (`swatch`) and
 *  resolve it (`cssVar`); the value is read live from globals.css. */
export type DSThemeColor = {
  name: string
  cssVar: string
  swatch: string
  /** Swatch is dark enough to need a light label drawn over it. */
  dark?: boolean
}

/** A foundation: a titled group of colour tokens. `caption` picks what the viewer
 *  reads — the `var()` provenance (roles) or the resolved value (raw palette). */
export type DSThemeColorGroup = {
  id: string
  title: string
  caption: 'provenance' | 'value'
  tokens: DSThemeColor[]
}

/** Tier 1 raw palette — curated stock stops + alpha tints + gradient. Hand-listed
 *  because the stock stops live in Tailwind, not globals.css, so there's nothing to
 *  scrape. Caption shows the resolved value (the name is the stop already). */
const palette: DSThemeColorGroup = {
  id: 'palette',
  title: 'Palette · primitives',
  caption: 'value',
  tokens: [
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
  ],
}

/** All colour foundations, in viewer order: generated roles/states, then palette. */
export const dsThemeColors: DSThemeColorGroup[] = [...generatedColorGroups, palette]

/** The type-scale utility names (generated, declaration order). */
export { dsThemeTextStyles }

/** Role suffixes (no `text-` prefix) that `cn()`'s twMerge registers as the single
 *  text-identity axis. Derived from the generated list — never hand-maintained. */
export const textRoleNames = dsThemeTextStyles.map((u) => u.slice('text-'.length))
