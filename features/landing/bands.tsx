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
    <h3 className="mb-4 text-eyebrow text-muted-foreground">
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
  const drive = hero?.drive?.trim()
  const craftAndScope = keywordLabels(hero?.craft, hero?.scope)

  return (
    <section className="relative">
      {banner}
      {/* The whole hero is ONE viewport (minus the sticky nav, ~3.5rem): wordmark,
          title, in-hero nav, chevron, and the Drive/Craft grid all share this block. */}
      <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center gap-10 py-10">
        <Container className="flex flex-col items-center gap-8 text-center">
          <Brand className="text-lg" />
          <h1 className="text-hero-headline uppercase">{hero?.title}</h1>
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
        {(drive || craftAndScope.length > 0) && (
          <Container>
            <div className="grid gap-10 sm:grid-cols-2">
              {drive && (
                <div>
                  {hero?.driveLabel && <BandLabel>{hero.driveLabel}</BandLabel>}
                  {/* Plain prose block; `whitespace-pre-line` honours any line
                      breaks the author types in the textarea. */}
                  <p className="whitespace-pre-line text-body text-foreground/90">{drive}</p>
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

/** Art-directed TL;DR background: one optimised crop per breakpoint family. */
const TLDR_BG = {
  mobile: '/images/asset-tldr-bg-mobile.webp', // 1290×2796 portrait
  tablet: '/images/asset-tldr-bg-tablet.webp', // 2048×2732 portrait
  desktop: '/images/asset-tldr-bg-desktop.webp', // 2560×1440 landscape (default <img>)
  ultrawide: '/images/asset-tldr-bg-ultrawide.webp', // 3840×2160 landscape
} as const

/**
 * TL;DR — the "Hi there! I'm Edu" band: greeting + an array of titled prose
 * blocks (the bio "Background" block is the first), set over a full-bleed photo
 * of Edu on stage.
 *
 * Pinned scroll-through, pure CSS (no scroll-jacking): the section is taller than
 * the viewport; the background is a sticky layer offset to the navbar's bottom
 * (`top-[3.5rem]`) that locks the instant the section's top reaches that border
 * and HOLDS while the copy column — pulled up over it with `-mt-[calc(100vh-3.5rem)]`
 * — scrolls past, then sticky releases on its own as the section ends and normal
 * scrolling resumes. The band stays a server component because the effect is
 * layout-only.
 *
 * Background is an art-directed <picture> (portrait crops on phone/tablet,
 * landscape on desktop+), so the browser fetches exactly one file and never
 * letterboxes a 16:9 frame onto a tall phone. This is the deliberate, isolated
 * exception to the `raw-<img>→next/image-only` rule: next/image can't swap aspect
 * ratio per breakpoint, and a decorative full-bleed background is the canonical
 * <picture> case. Each crop is composed to keep the copy clear of the subject, so
 * no scrim is needed at any breakpoint; the copy is explicitly light (not the
 * shared foreground tokens) because the photo is dark and the site is light-themed.
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
  const subtitle = tldr?.subtitle ? fillYears(tldr.subtitle) : ''

  return (
    <section id={id} className="relative isolate w-full scroll-mt-24">
      {/* Pinned, full-bleed background. `isolate` keeps the `-z-10` layer behind
          the copy but in front of the page, never escaping behind <body>. */}
      <div className="sticky top-[3.5rem] -z-10 h-[calc(100vh-3.5rem)] w-full overflow-hidden">
        <picture>
          <source media="(max-width: 767px)" srcSet={TLDR_BG.mobile} />
          <source media="(max-width: 1023px)" srcSet={TLDR_BG.tablet} />
          <source media="(min-width: 1536px)" srcSet={TLDR_BG.ultrawide} />
          {/* Raw <img> (not next/image) is intentional here — art-directed
              full-bleed background; see band docblock. */}
          {/* `object-top` anchors the top edge so the subject's head is never
              cropped; any overflow is shaved off the bottom instead. */}
          <img
            src={TLDR_BG.desktop}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover object-top"
          />
        </picture>
      </div>

      {/* Copy column, pulled up to overlay the pinned background — this is what
          actually scrolls. The pull-up matches the background height so the column
          starts flush at the navbar's bottom; the 50vh `pt`/`pb` let the photo play
          as an intro before the copy scrolls in and an outro after it leaves. The
          column is what makes the section taller than the viewport, driving the
          scroll-through. */}
      <div className="relative -mt-[calc(100vh-3.5rem)]">
        <Container className="flex min-h-[calc(100vh-3.5rem)] flex-col justify-start pb-[50vh] pt-[50vh] text-white">
          <div className="max-w-[60vw] md:max-w-sm">
            {greeting && <h2 className="mb-6 text-header tracking-tight">{greeting}</h2>}
            {subtitle && (
              <p className="mb-12 max-w-2xl whitespace-pre-line text-lead text-white/75">
                {subtitle}
              </p>
            )}
            <div className="space-y-12">
              {blocks.map((block, i) => (
                <div key={block.id ?? i}>
                  <h3 className="mb-4 text-eyebrow text-white/60">
                    {block.title}
                  </h3>
                  <ul className="space-y-6">
                    {proseLines(block.body)
                      .map(fillYears)
                      .map((line, j) => (
                        <li key={j} className="flex gap-3">
                          <span aria-hidden className="mt-1.5 shrink-0">
                            <Chevron
                              direction="right"
                              color="text-white/60"
                              className="h-3.5 w-auto"
                            />
                          </span>
                          <p className="text-body text-white/90">{line}</p>
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </div>
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
        <h2 className="text-header tracking-tight">{section?.heading}</h2>
        {section?.subheader && (
          <p className="mt-3 max-w-2xl text-lead text-muted-foreground">{section.subheader}</p>
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
        <h2 className="text-header tracking-tight">{data?.heading}</h2>
        {data?.subheader && <p className="mt-3 text-lead text-muted-foreground">{data.subheader}</p>}

        {/* Map renders here once its feature branch lands. */}
        <div className="mt-10 rounded-2xl border border-dashed border-border p-6 sm:p-10">
          {teaser?.eyebrow && (
            <p className="text-eyebrow text-primary">
              {teaser.eyebrow}
            </p>
          )}
          {teaser?.title && (
            <h3 className="mt-1 text-card-title">{teaser.title}</h3>
          )}
          {teaser?.description && (
            <p className="mt-3 text-body text-muted-foreground">{teaser.description}</p>
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
        <h2 className="text-header tracking-tight">{contact?.header}</h2>
        {contact?.subheader && (
          <p className="mt-3 max-w-2xl text-lead text-foreground/80">{contact.subheader}</p>
        )}
        {contact?.description && (
          <p className="mt-3 max-w-2xl text-body text-muted-foreground">{contact.description}</p>
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
