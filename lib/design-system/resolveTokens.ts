/**
 * Reads the live design system off the rendered page, so the viewer never
 * restates a value `globals.css` already owns. Two reads:
 *
 *  - `resolveValue` — the COMPUTED custom-property value off `:root` (the colour
 *    the browser resolved). Robust everywhere.
 *  - `resolveProvenance` — the AUTHORED declaration text (`var(--color-slate-900)`
 *    → `slate-900`), recovered from the stylesheet rule because `getComputedStyle`
 *    only ever returns the resolved value, never the `var()` reference that tells
 *    you which stock stop a role maps to.
 *
 * Browser-only (touches `document` / `getComputedStyle`) — import from a client
 * component. Type specs are read the same live way via `resolveTextStyle`.
 */

const VAR_REF = /^var\(\s*(--[\w-]+?)\s*\)$/

/** `var(--color-slate-900)` → `slate-900`; `var(--accent)` → `accent`. Anything
 *  that isn't a bare `var()` reference (an `oklch()`/`color-mix()` literal) is
 *  returned trimmed, unchanged. */
function friendlyRef(declared: string): string {
  const m = declared.trim().match(VAR_REF)
  if (!m) return declared.trim()
  return m[1].replace(/^--(color-)?/, '')
}

/** The resolved value of a `:root` custom property (e.g. an `oklch(...)` colour
 *  or the gradient string). Empty string if undefined. */
export function resolveValue(cssVar: string): string {
  if (typeof window === 'undefined') return ''
  return getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim()
}

/** The friendly provenance of a role token — which stock stop / role it points at
 *  — read from the authored `:root` declaration. `null` if the rule text can't be
 *  reached (e.g. a cross-origin or oddly-minified sheet); callers fall back to the
 *  resolved value. */
export function resolveProvenance(cssVar: string): string | null {
  if (typeof window === 'undefined') return null
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList
    try {
      rules = sheet.cssRules
    } catch {
      continue // cross-origin sheet — not readable, skip
    }
    for (const rule of Array.from(rules)) {
      if (!(rule instanceof CSSStyleRule)) continue
      // Tailwind may emit `:root, :host` — match either selector in the list.
      const selectors = rule.selectorText.split(',').map((s) => s.trim())
      if (!selectors.includes(':root')) continue
      const declared = rule.style.getPropertyValue(cssVar)
      if (declared) return friendlyRef(declared)
    }
  }
  return null
}

/** The caption shown under a colour swatch: provenance for semantic roles (the
 *  stop they map to), the resolved value for raw palette stops. Falls back to the
 *  resolved value when provenance isn't recoverable. */
export function resolveCaption(cssVar: string, kind: 'provenance' | 'value'): string {
  if (kind === 'value') return resolveValue(cssVar)
  return resolveProvenance(cssVar) ?? resolveValue(cssVar)
}

/**
 * Read a type role's spec straight off a rendered element via `getComputedStyle`,
 * so the caption is the truth the browser resolved — it can never drift from the
 * `@utility text-*` definition. Fluid `clamp()` roles report their CURRENT px.
 */
export function resolveTextStyle(el: HTMLElement): string {
  const cs = getComputedStyle(el)
  const fontSize = parseFloat(cs.fontSize)
  const lineHeightPx = parseFloat(cs.lineHeight)

  const family = /condensed/i.test(cs.fontFamily) ? 'Condensed' : 'Roboto'

  const weight = cs.fontWeight
  const weightLabel = weight === '500' ? 'Medium 500' : weight === '700' ? 'Bold 700' : weight

  const size = String(Math.round(fontSize))
  const lh = Number.isFinite(lineHeightPx)
    ? `LH ${Math.round((lineHeightPx / fontSize) * 100)}%`
    : `LH ${cs.lineHeight}`

  const transform = cs.textTransform !== 'none' ? cs.textTransform : null

  return [family, weightLabel, size, lh, transform].filter(Boolean).join(' · ')
}
