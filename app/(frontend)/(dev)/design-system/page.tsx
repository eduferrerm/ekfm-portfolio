import { Search, X } from 'lucide-react'
import type { Metadata } from 'next'

import { TypeSpecimen } from './TypeSpecimen'
import { Chevron } from '@/components/primitives/Chevron'
import { Tag } from '@/components/primitives/Tag'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

/**
 * Living specimen of the design-token + type layer (globals.css) and the cva
 * component layer on top of it. Renders every semantic color role, the raw
 * palette primitives, the state tokens, the surface gradient, the full type
 * scale, and the Button/Tag/Card variants so the system can be reviewed whole.
 *
 * It consumes the semantic utilities this layer ships (bg-primary, text-card-title,
 * …). The palette section is the one place that intentionally shows raw primitives
 * (bg-lime-200, …) — it exists to document them.
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
  ['selection', 'blue-400 (secondary)', 'bg-selection', true],
  ['label', 'blue-400 (secondary)', 'bg-label', true],
  ['feedback', 'lime-200 (primary)', 'bg-feedback', true],
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

// ── Type scale (Tier 4) — the @utility roles; specs are read live off the DOM ──
// (see TypeSpecimen) so the caption can never drift from globals.css.
const TYPE: string[] = [
  'text-header',
  'text-subtitle',
  'text-subheader',
  'text-lead',
  'text-body',
  'text-list',
  'text-eyebrow',
  'text-hero-list',
  'text-aside',
  'text-nav',
  'text-ui',
  'text-ui-bold',
  'text-card-title',
  'text-card-body',
  'text-meta',
  'text-meta-bold',
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
        <p className="text-body text-muted-foreground">
          Three brand tiers: <span className="text-primary">primary / lime</span> (emphasis),{' '}
          <span className="text-label">secondary / blue</span> (selection &amp; labels),{' '}
          <span className="text-accent">tertiary / fuchsia</span> (focus). Tokens are named by job
          and share a tier&apos;s hue.
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
        <SectionHeading>Components · cva</SectionHeading>
        <p className="text-meta text-muted-foreground">
          Hover / focus / active states are interactive — tab to a control or hover it to see the
          channels (focus = fuchsia ring, hover = lime affordance, press = lime feedback).
        </p>

        <div className="flex flex-col gap-3">
          <p className="text-meta-bold text-foreground">Button · primary / secondary / ghost</p>
          <div className="flex flex-wrap items-center gap-4">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button disabled>Disabled</Button>
            <Button size="sm" variant="secondary">
              Small
            </Button>
            <Button size="icon" variant="ghost" aria-label="Close (icon size)">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-meta-bold text-foreground">
            Input · fuchsia focus ring (tab in to see the focus channel)
          </p>
          <div className="relative max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search" aria-label="Specimen search" className="pl-9 pr-3" />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-meta-bold text-foreground">Tag · default / selected (lime fill)</p>
          <div className="flex flex-wrap items-center gap-2">
            <Tag>Default</Tag>
            <Tag selected>Selected</Tag>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-meta-bold text-foreground">
            Card · static / interactive (hover+focus) / selected (blue)
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <p className="text-card-title text-foreground">Static</p>
              <p className="mt-2 text-card-body text-muted-foreground">Plain surface.</p>
            </Card>
            <Card asChild interactive>
              <a href="#" className="block">
                <p className="text-card-title text-foreground">Interactive</p>
                <p className="mt-2 text-card-body text-muted-foreground">Hover / focus me.</p>
              </a>
            </Card>
            <Card selected>
              <p className="text-card-title text-foreground">Selected</p>
              <p className="mt-2 text-card-body text-muted-foreground">You-are-here (blue).</p>
            </Card>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-meta-bold text-foreground">
            Chevron · directional glyph (recolours by prop; composes into a Button)
          </p>
          <div className="flex flex-wrap items-center gap-5">
            <Chevron direction="up" color="text-muted-foreground" />
            <Chevron direction="right" color="text-muted-foreground" />
            <Chevron direction="down" color="text-muted-foreground" />
            <Chevron direction="left" color="text-muted-foreground" />
            <Button variant="ghost" size="icon" aria-label="Chevron in a button">
              <Chevron direction="down" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-meta-bold text-foreground">
            Nav active state · text-nav, lime underline (you-are-here)
          </p>
          <ul className="flex items-center gap-x-5">
            <li>
              <span className="text-nav text-muted-foreground">TLDR</span>
            </li>
            <li>
              <span className="text-nav text-foreground underline decoration-primary underline-offset-4">
                Portfolio
              </span>
            </li>
            <li>
              <span className="text-nav text-muted-foreground">Contact</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="flex flex-col gap-8">
        <SectionHeading>Type scale</SectionHeading>
        <p className="text-meta text-muted-foreground">
          Every caption is read live off the rendered specimen via getComputedStyle — it cannot
          drift from globals.css. Fluid roles report their current rendered px; resize to watch them
          track.
        </p>

        {/* Hero headline gets its own row — its sample would crowd the others. */}
        <TypeSpecimen
          utility="text-hero-headline"
          sample="headline"
          className="border-b border-border pb-8"
        />

        <div className="flex flex-col gap-8">
          {TYPE.map((utility) => (
            <TypeSpecimen key={utility} utility={utility} />
          ))}
        </div>
      </section>
    </main>
  )
}
