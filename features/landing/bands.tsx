import Link from 'next/link'

import { Chevron } from '@/components/primitives/Chevron'
import { Container } from '@/components/Container'
import { List } from '@/components/primitives/List'
import type { Landing } from '@/payload-types'
import { keywordLabels } from '@/lib/keywords'
import { proseLines } from '@/lib/prose'

import { Brand } from './Brand'
import { LandingCard } from './LandingCard'
import { NavList, type NavItem } from './NavList'
import { HERO_NAV_ATTR } from './navReveal'
import type { LandingCardData } from './projections'

/** Vertical rhythm shared by every band; width + gutter come from <Container>. */
const BAND_SPACING = 'py-20'

/** Small uppercase band sub-label ("Drive", "Craft", "Dive into"). */
function BandLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
      {children}
    </h3>
  )
}

/**
 * Hero — the un-anchored top band. One viewport (minus the sticky nav) holding a
 * single centered stack: EKFM wordmark → "PRODUCT ENGINEERING" title → an in-hero
 * copy of the nav → a chevron scroll-cue → the Drive prose + "Craft & Scope" tag
 * list. Everything shares this 100vh block. Not a `sections` entry.
 *
 * The in-hero nav is the visible nav at the top; the sticky nav's wordmark + links
 * stay hidden until this copy scrolls away (it carries `HERO_NAV_ATTR`, watched by
 * `StickyNavReveal`), so the two copies are never both on screen. This copy is
 * `decorative` (aria-hidden, unfocusable) — the sticky nav is the single real nav
 * landmark, so the duplicated links don't dilute the a11y tree.
 *
 * `relative` so the visitor `banner` slot can absolutely-position itself within
 * the hero (top); omitted on the canonical `/`.
 */
export function HeroBand({
  hero,
  navItems,
  banner,
}: {
  hero: Landing['hero']
  navItems: NavItem[]
  banner?: React.ReactNode
}) {
  const drive = proseLines(hero?.drive)
  const craftAndScope = keywordLabels(hero?.craft, hero?.scope)

  return (
    <section className="relative">
      {banner}
      {/* The whole hero is ONE viewport (minus the sticky nav, ~3.5rem): wordmark,
          title, in-hero nav, chevron, and the Drive/Craft grid all share this block. */}
      <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center gap-10 py-10">
        <Container className="flex flex-col items-center gap-8 text-center">
          <Brand className="text-lg" />
          <h1 className="text-5xl font-semibold tracking-tight sm:text-7xl">{hero?.title}</h1>
          {navItems.length > 0 && (
            <div {...{ [HERO_NAV_ATTR]: '' }}>
              <NavList
                items={navItems}
                decorative
                className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm"
                linkClassName="uppercase tracking-wide text-muted-foreground transition hover:text-foreground"
              />
            </div>
          )}
        </Container>
        <span className="animate-bounce">
          <Chevron direction="down" color="text-muted-foreground" />
        </span>
        {(drive.length > 0 || craftAndScope.length > 0) && (
          <Container>
            <div className="grid gap-10 sm:grid-cols-2">
              {drive.length > 0 && (
                <div>
                  {hero?.driveLabel && <BandLabel>{hero.driveLabel}</BandLabel>}
                  <List variant="prose" items={drive} />
                </div>
              )}
              {craftAndScope.length > 0 && (
                <div>
                  {hero?.listLabel && <BandLabel>{hero.listLabel}</BandLabel>}
                  <List variant="tag" items={craftAndScope} />
                </div>
              )}
            </div>
          </Container>
        )}
      </div>
    </section>
  )
}

/**
 * TL;DR — the "Hi there! I'm Edu" band: greeting + an array of titled prose
 * blocks (the bio "Background" block is the first).
 */
export function TldrBand({
  id,
  tldr,
  yearsLabel,
}: {
  id: string
  tldr: Landing['tldr']
  yearsLabel?: string
}) {
  const blocks = tldr?.blocks ?? []
  // Inject the computed years-of-experience wherever the author drops a `{years}`
  // token in the TL;DR copy — the surrounding words stay in the CMS, code supplies
  // only the figure. Resolves to '' when there is no datable experience.
  const fillYears = (text: string) => text.replaceAll('{years}', yearsLabel ?? '')
  const greeting = tldr?.greeting ? fillYears(tldr.greeting) : ''

  return (
    <section id={id} className="scroll-mt-24">
      <Container className={BAND_SPACING}>
        {greeting && <h2 className="mb-12 text-4xl font-semibold tracking-tight">{greeting}</h2>}
        <div className="space-y-12">
          {blocks.map((block, i) => (
            <div key={block.id ?? i}>
              <BandLabel>{block.title}</BandLabel>
              <List variant="prose" items={proseLines(block.body).map(fillYears)} />
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}

/**
 * Shared Experience/Portfolio band: heading + descriptive subheader, a labelled
 * "Dive into" list, and the projected cards. Same shape for both — only the copy
 * group, the card set, and the CTA label differ.
 */
export function LandingSectionBand({
  id,
  section,
  cards,
  ctaLabel,
}: {
  id: string
  section: Landing['portfolio']
  cards: LandingCardData[]
  ctaLabel: string
}) {
  const diveItems = proseLines(section?.diveInto?.items)

  return (
    <section id={id} className="scroll-mt-24">
      <Container className={BAND_SPACING}>
        <h2 className="text-3xl font-semibold tracking-tight">{section?.heading}</h2>
        {section?.subheader && (
          <p className="mt-3 max-w-2xl text-muted-foreground">{section.subheader}</p>
        )}

        <div className="mt-10 grid gap-10">
          {diveItems.length > 0 && (
            <div>
              {section?.diveInto?.subheader && <BandLabel>{section.diveInto.subheader}</BandLabel>}
              <List variant="prose" items={diveItems} />
            </div>
          )}
          {cards.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {cards.map((card, i) => (
                <LandingCard key={`${card.href}-${i}`} card={card} ctaLabel={ctaLabel} />
              ))}
            </div>
          )}
        </div>
      </Container>
    </section>
  )
}

/**
 * More About Me — heading + subheader, then space reserved for the relational
 * map (its own feature branch) above a teaser card that contextualises it. The
 * card has no link yet; the map feature wires it.
 */
export function MoreAboutMeBand({ id, data }: { id: string; data: Landing['moreAboutMe'] }) {
  const teaser = data?.teaser
  const teaserItems = proseLines(teaser?.items)

  return (
    <section id={id} className="scroll-mt-24">
      <Container className={BAND_SPACING}>
        <h2 className="text-3xl font-semibold tracking-tight">{data?.heading}</h2>
        {data?.subheader && <p className="mt-3 text-muted-foreground">{data.subheader}</p>}

        {/* Map renders here once its feature branch lands. */}
        <div className="mt-10 rounded-2xl border border-dashed border-border p-6 sm:p-10">
          {teaser?.eyebrow && (
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              {teaser.eyebrow}
            </p>
          )}
          {teaser?.title && (
            <h3 className="mt-1 text-xl font-semibold tracking-tight">{teaser.title}</h3>
          )}
          {teaser?.description && (
            <p className="mt-3 text-muted-foreground">{teaser.description}</p>
          )}
          {teaserItems.length > 0 && <List variant="prose" items={teaserItems} className="mt-6" />}
          {teaser?.ctaLabel && (
            <span className="mt-8 inline-flex w-fit items-center rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground">
              {teaser.ctaLabel}
            </span>
          )}
        </div>
      </Container>
    </section>
  )
}

/** Contact — closing band with a CTA out (the LinkedIn link in the mock). */
export function ContactBand({ id, contact }: { id: string; contact: Landing['contact'] }) {
  return (
    <section id={id} className="scroll-mt-24">
      <Container className={BAND_SPACING}>
        <h2 className="text-3xl font-semibold tracking-tight">{contact?.header}</h2>
        {contact?.subheader && (
          <p className="mt-3 max-w-2xl text-lg text-foreground/80">{contact.subheader}</p>
        )}
        {contact?.description && (
          <p className="mt-3 max-w-2xl text-muted-foreground">{contact.description}</p>
        )}
        {contact?.ctaUrl && contact?.ctaLabel && (
          <Link
            href={contact.ctaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center rounded-full border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted"
          >
            {contact.ctaLabel}
          </Link>
        )}
      </Container>
    </section>
  )
}
