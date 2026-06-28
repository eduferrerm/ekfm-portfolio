import type { Metadata } from 'next'

import { PreviewColor } from './PreviewColor'
import { PreviewComponents } from './PreviewComponents'
import { PreviewSection } from './PreviewSection'
import { PreviewTextStyle } from './PreviewTextStyle'
import { dsThemeColors, dsThemeTextStyles } from '@/lib/design-system/tokens'

/**
 * Dev-only VIEWER for the design system. It owns no design values — it reads the
 * route-agnostic catalog (`lib/design-system/tokens`) and resolves every colour
 * and type spec live from `globals.css` (the value SSOT). So the page renders the
 * system; it never redefines it.
 *
 * Lives in a (dev) route group so it serves at /design-system but is not a
 * canonical section (route-parity.test ignores it; no /dear twin).
 */
export const metadata: Metadata = {
  title: 'Design System — EKFM',
  robots: { index: false, follow: false },
}

const featured = dsThemeTextStyles.find((s) => s.feature)
const scale = dsThemeTextStyles.filter((s) => !s.feature)

export default function DesignSystemPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-16 px-6 py-16">
      <header className="flex flex-col gap-2">
        <p className="text-eyebrow text-muted-foreground">EKFM · Design System</p>
        <h1 className="text-header text-foreground">Tokens &amp; Type</h1>
        <p className="text-body text-muted-foreground">
          The CSS foundation: semantic color roles, palette primitives, state tokens, the surface
          gradient, and the semantic type scale. Components consume these utilities — never raw
          primitives or vars. Every caption here is read live off globals.css.
        </p>
        <p className="text-body text-muted-foreground">
          Three brand tiers: <span className="text-primary">primary / lime</span> (emphasis),{' '}
          <span className="text-label">secondary / blue</span> (selection &amp; labels),{' '}
          <span className="text-accent">tertiary / fuchsia</span> (focus). Tokens are named by job
          and share a tier&apos;s hue.
        </p>
      </header>

      {dsThemeColors.map((group) => (
        <PreviewSection key={group.id} title={group.title} className="gap-5">
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
            {group.tokens.map((token) => (
              <PreviewColor key={token.name} token={token} caption={group.caption} />
            ))}
          </div>
        </PreviewSection>
      ))}

      <PreviewSection title="Focus & selection — state demo" className="gap-5">
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
      </PreviewSection>

      <PreviewSection title="Components · cva">
        <PreviewComponents />
      </PreviewSection>

      <PreviewSection title="Type scale">
        <p className="text-meta text-muted-foreground">
          Every caption is read live off the rendered specimen via getComputedStyle — it cannot
          drift from globals.css. Fluid roles report their current rendered px; resize to watch them
          track.
        </p>
        {featured && <PreviewTextStyle style={featured} className="border-b border-border pb-8" />}
        <div className="flex flex-col gap-8">
          {scale.map((style) => (
            <PreviewTextStyle key={style.utility} style={style} />
          ))}
        </div>
      </PreviewSection>
    </main>
  )
}
