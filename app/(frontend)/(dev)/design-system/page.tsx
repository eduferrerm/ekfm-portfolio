import type { Metadata } from 'next'

/**
 * Living specimen of the design-token + type layer (globals.css). Renders every
 * semantic color role, the raw palette primitives, the state tokens, the surface
 * gradient, and the full type scale so token decisions can be reviewed as a whole.
 *
 * It consumes the semantic utilities this layer ships (bg-primary, text-card-title,
 * …). The palette section is the one place that intentionally shows raw primitives
 * (bg-lime-200, …) — it exists to document them. No components (Button/Tag/Card)
 * yet; those are later tasks.
 *
 * Lives in a (dev) route group so it serves at /design-system but is not a
 * canonical section (route-parity.test ignores it; no /dear twin).
 */
export const metadata: Metadata = {
  title: 'Design System — EKFM',
  robots: { index: false, follow: false },
}

// ── Semantic color roles (Tier 2) — token → underlying palette value ──────────
const ROLES: Array<[name: string, value: string, swatch: string, dark?: boolean]> = [
  ['background', 'slate-900', 'bg-background'],
  ['foreground', 'slate-300', 'bg-foreground', true],
  ['card', 'slate-800', 'bg-card'],
  ['card-foreground', 'slate-300', 'bg-card-foreground', true],
  ['muted', 'slate-700', 'bg-muted'],
  ['muted-foreground', 'slate-400', 'bg-muted-foreground', true],
  ['border', 'slate-700', 'bg-border'],
  ['input', 'slate-700', 'bg-input'],
  ['primary', 'lime-200', 'bg-primary', true],
  ['primary-foreground', 'slate-900', 'bg-primary-foreground'],
  ['accent', 'fuchsia-300', 'bg-accent', true],
  ['accent-foreground', 'slate-900', 'bg-accent-foreground'],
  ['ring', 'accent → fuchsia-300', 'bg-ring', true],
]

// ── Interaction state tokens (Tier 2) ─────────────────────────────────────────
const STATE: Array<[name: string, value: string, swatch: string, dark?: boolean]> = [
  ['selection', 'blue-400', 'bg-selection', true],
  ['feedback', 'lime-200', 'bg-feedback', true],
  ['scrim', 'slate-900/50', 'bg-scrim'],
]

// ── Raw palette primitives (Tier 1) — exactly the brand Colors sheet stops ─────
const PALETTE: Array<[name: string, swatch: string, dark?: boolean]> = [
  ['lime / 200', 'bg-lime-200', true],
  ['lime / 200 / 20', 'bg-lime-200-20'],
  ['fuchsia / 300', 'bg-fuchsia-300', true],
  ['blue / 400', 'bg-blue-400', true],
  ['blue / 400 / 20', 'bg-blue-400-20'],
  ['slate / 900', 'bg-slate-900'],
  ['slate / 900 / 50', 'bg-slate-900-50'],
  ['slate / 800', 'bg-slate-800'],
  ['slate / 700', 'bg-slate-700'],
  ['slate / 600', 'bg-slate-600'],
  ['slate / 400', 'bg-slate-400', true],
  ['slate / 300', 'bg-slate-300', true],
  ['gradient', 'bg-gradient-surface'],
]

// ── Type scale (Tier 4) — utility, sample, spec from the brand Fonts sheet ─────
const TYPE: Array<[utility: string, spec: string]> = [
  ['text-header', 'Condensed · Medium 500 · 40 · LH 150%'],
  ['text-subtitle', 'Roboto · 400 · 24 · LH 125%'],
  ['text-subheader', 'Condensed · Medium 500 · 18 · LH 100%'],
  ['text-lead', 'Roboto · 400 · 18 · LH 150%'],
  ['text-body', 'Roboto · 400 · 16 · LH 150%'],
  ['text-list', 'Roboto · 400 · 14 · LH 100%'],
  ['text-eyebrow', 'Roboto · Bold 700 · 12 · LH 100%'],
  ['text-hero-list', 'Roboto · 400 · 12 · LH 200%'],
  ['text-menu-subpage', 'Condensed · Medium 500 · 24 · LH 100% · capitalize'],
  ['text-menu-main', 'Condensed · Medium 500 · 16 · LH 100% · capitalize'],
  ['text-ui', 'Roboto · 400 · 14 · LH 100%  (sheet: primary)'],
  ['text-ui-bold', 'Roboto · Bold 700 · 14 · LH 100%  (sheet: primary/bold)'],
  ['text-card-title', 'Roboto · 400 · 24 · LH 100%'],
  ['text-card-body', 'Roboto · 400 · 14 · LH ~143% (20/14)'],
  ['text-meta', 'Roboto · 400 · 12 · LH 100%'],
  ['text-meta-bold', 'Roboto · Bold 700 · 12 · LH 100%'],
]

function ColorSwatch({ name, value, swatch }: { name: string; value: string; swatch: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className={`h-16 rounded-lg border border-border ${swatch}`} />
      <div>
        <div className="text-meta-bold text-foreground">{name}</div>
        <div className="text-meta text-muted-foreground">{value}</div>
      </div>
    </div>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="text-subheader text-primary">{children}</h2>
}

export default function DesignSystemPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-16 px-6 py-16">
      <header className="flex flex-col gap-2">
        <p className="text-eyebrow text-muted-foreground">EKFM · Design System</p>
        <h1 className="text-header text-foreground">Tokens &amp; Type</h1>
        <p className="text-body text-muted-foreground">
          The CSS foundation: semantic color roles, palette primitives, state tokens, the surface
          gradient, and the semantic type scale. Components consume these utilities — never raw
          primitives or vars.
        </p>
      </header>

      <section className="flex flex-col gap-5">
        <SectionHeading>Color roles · semantic</SectionHeading>
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
          {ROLES.map(([name, value, swatch]) => (
            <ColorSwatch key={name} name={name} value={value} swatch={swatch} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <SectionHeading>State tokens</SectionHeading>
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
          {STATE.map(([name, value, swatch]) => (
            <ColorSwatch key={name} name={name} value={value} swatch={swatch} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <SectionHeading>Palette · primitives</SectionHeading>
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
          {PALETTE.map(([name, swatch]) => (
            <ColorSwatch key={name} name={name} value={swatch} swatch={swatch} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <SectionHeading>Focus &amp; selection — state demo</SectionHeading>
        <div className="flex flex-wrap items-center gap-6">
          <button className="rounded-md bg-primary px-4 py-2 text-ui-bold text-primary-foreground outline-none ring-2 ring-ring ring-offset-2 ring-offset-background">
            Focused (ring = accent)
          </button>
          <span className="text-ui text-selection underline decoration-selection underline-offset-4">
            Selected marker (selection)
          </span>
          <span className="rounded-sm bg-selection/20 px-2 py-1 text-ui text-foreground ring-1 ring-selection">
            Selected fill (selection / 20)
          </span>
        </div>
      </section>

      <section className="flex flex-col gap-8">
        <SectionHeading>Type scale</SectionHeading>

        {/* Hero headline gets its own row — 103px would break the grid. */}
        <div className="flex flex-col gap-1 border-b border-border pb-8">
          <p className="text-meta text-muted-foreground">
            text-hero-headline · Condensed · Medium 500 · 103 · LH 100% · capitalize
          </p>
          <p className="text-hero-headline text-foreground">headline</p>
        </div>

        <div className="flex flex-col gap-8">
          {TYPE.map(([utility, spec]) => (
            <div key={utility} className="flex flex-col gap-1">
              <p className="text-meta text-muted-foreground">
                {utility} · {spec}
              </p>
              <p className={`${utility} text-foreground`}>
                The quick brown fox jumps over the lazy dog
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
