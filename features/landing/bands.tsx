import Link from 'next/link'

import { Chevron } from '@/components/primitives/Chevron'
import { Container } from '@/components/Container'
import { List } from '@/components/primitives/List'
import { Button } from '@/components/ui/button'
import type { Landing } from '@/payload-types'
import { keywordLabels } from '@/lib/keywords'
import { proseLines } from '@/lib/prose'

import { Brand } from './Brand'
import { LandingCard } from './LandingCard'
import { MentalGraphClient } from './more-about-me/MentalGraphClient'
import { NavList, type NavItem } from './NavList'
import { HERO_NAV_ATTR } from './navReveal'
import type { LandingCardData, MoreAboutMeCta } from './projections'

/** Vertical rhythm shared by every band; width + gutter come from <Container>. */
const BAND_SPACING = 'py-20'

/** Small uppercase band sub-label ("Drive", "Craft", "Dive into"). */
function BandLabel({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-10 text-subheader text-muted-foreground">{children}</h3>
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
      <div className="flex min-h-[calc(100vh-var(--header-h))] flex-col items-center justify-center gap-10 py-10">
        <Container className="flex flex-col items-center gap-8 text-center">
          <Brand className="text-lg" />
          <h1 className="text-hero-headline uppercase text-muted">{hero?.title}</h1>
          {navItems.length > 0 && (
            // The in-hero nav LINKS are hidden below md (no inline nav on phones),
            // but this wrapper stays laid out at every width so it remains the reveal
            // sentinel: the IntersectionObserver in StickyNavReveal tracks it on
            // mobile too, so the sticky logo parks at the top and reveals on scroll
            // exactly as it does on desktop.
            <div {...{ [HERO_NAV_ATTR]: '' }}>
              <NavList
                items={navItems}
                decorative
                separated
                className="hidden md:flex flex-wrap items-center justify-center gap-y-2"
                linkClassName="text-nav text-muted-foreground transition hover:text-foreground"
              />
            </div>
          )}
          <div className="animate-bounce mb-5 md:mb-20">
            <Chevron direction="down" color="text-primary" className="h-12" />
          </div>
        </Container>
        <Container>
          {(drive || craftAndScope.length > 0) && (
            <div className="flex flex-col md:flex-row justify-center items-center md:items-start gap-22.5 ">
              {drive && (
                <div className="text-center md:text-start md:max-w-62.5 flex flex-col ">
                  {hero?.driveLabel && <BandLabel>{hero.driveLabel}</BandLabel>}
                  {/* Plain prose block; `whitespace-pre-line` honours any line
                      breaks the author types in the textarea. */}
                  <p className="whitespace-pre-line text-lead text-foreground/90">{drive}</p>
                </div>
              )}
              {craftAndScope.length > 0 && (
                <div>
                  {hero?.listLabel && <BandLabel>{hero.listLabel}</BandLabel>}
                  <List variant="text" items={craftAndScope} itemsClassName="w-[50%] lg:w-[25%]" />
                </div>
              )}
            </div>
          )}
        </Container>
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
 * (`top-[var(--header-h)]`) that locks the instant the section's top reaches that
 * border and HOLDS while the copy column — pulled up with `-mt-[calc(100vh_-_var(--header-h))]`
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
 * no overlay/dimming is needed at any breakpoint; the copy is explicitly light (not the
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
    <section id={id} className="relative isolate w-full">
      {/* Pinned, full-bleed background. `isolate` keeps the `-z-10` layer behind
          the copy but in front of the page, never escaping behind <body>. */}
      <div className="sticky top-(--header-h) -z-10 h-[calc(100vh-var(--header-h))] w-full overflow-hidden">
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
      <div className="relative -mt-[calc(100vh-var(--header-h))]">
        <Container className="flex min-h-[calc(100vh-var(--header-h))] flex-col justify-start pb-[50vh] pt-[50vh] text-white">
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
                  <h3 className="mb-10 text-subheader text-primary">{block.title}</h3>
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
    <section id={id}>
      <Container className={BAND_SPACING}>
        <h2 className="text-header tracking-tight text-muted-foreground">{section?.heading}</h2>
        {section?.subheader && <p className="mt-3 max-w-2xl text-lead">{section.subheader}</p>}

        <div className="mt-10 grid gap-10">
          {diveItems.length > 0 && (
            <div>
              {section?.diveInto?.subheader && <BandLabel>{section.diveInto.subheader}</BandLabel>}
              <List variant="prose" items={diveItems} chevronColor="text-label" />
            </div>
          )}
          {cards.length > 0 && (
            // Below xl (1280px) the cards are a horizontally scrolling shelf of
            // fixed-width cards; at xl the shelf becomes a 3-up grid whose cards
            // grow to fill their column. `-mx-6 px-6` full-bleeds the shelf past
            // the Container's px-6 gutter so cards scroll to the true edge (not
            // cut off a gutter early) while the first card still aligns with the
            // heading; `py-2` gives the focus ring room the shelf's overflow-x
            // (which forces overflow-y) would otherwise clip. `items-start` stops
            // flex/grid from stretching cards to the tallest sibling, which would
            // override each card's 3:4 aspect ratio. Scrollbar hidden (the scroll
            // affordance is the peeking next card, not a bar).
            <div className="-mx-6 flex items-start gap-6 overflow-x-auto px-6 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden xl:mx-0 xl:grid xl:grid-cols-3 xl:overflow-visible xl:px-0 xl:py-0">
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
 * More About Me — heading + subheader, then the relational mental-graph map, with
 * a teaser card beneath that contextualises it. The map is the precomputed
 * ~400-node graph (features/landing/more-about-me), mounted client-only.
 */
export function MoreAboutMeBand({
  id,
  data,
  cta,
}: {
  id: string
  data: Landing['moreAboutMe']
  cta: MoreAboutMeCta | null
}) {
  const teaser = data?.teaser
  const teaserItems = proseLines(teaser?.items)

  return (
    <section id={id}>
      <Container className={BAND_SPACING}>
        <h2 className="text-header text-muted-foreground tracking-tight">{data?.heading}</h2>
        {data?.subheader && <p className="mt-3 text-lead">{data.subheader}</p>}

        {/* The relational map. Fixed height so the lazy client bundle swaps in
            without shifting the page (the skeleton fills the same box). The panel's
            own dark fill delineates it — no border. */}
        <div className="mt-10 h-[60vh] min-h-100 overflow-hidden rounded-2xl">
          <MentalGraphClient />
        </div>

        <div className="mt-6 rounded-2xl border border-border p-6 sm:p-10 flex flex-wrap items-center bg-sunken/70">
          <div className="w-full md:w-[50%]">
            {teaser?.eyebrow && <p className="text-eyebrow text-primary">{teaser.eyebrow}</p>}
            {teaser?.title && <h3 className="mt-1 text-card-title">{teaser.title}</h3>}
            {teaser?.description && (
              <p className="mt-3 text-body text-muted-foreground">{teaser.description}</p>
            )}
          </div>
          <div className="flex flex-wrap md:w-[50%]">
            {teaserItems.length > 0 && (
              <List
                variant="prose"
                items={teaserItems}
                className="mt-6 flex flex-wrap gap-2 md:p-2"
                itemsClassName="md:w-[45%]"
                chevronColor="text-label"
              />
            )}
          </div>
          <div>
            {cta && (
              <Button asChild variant="secondary" className="mt-8">
                <Link href={cta.href}>{cta.label}</Link>
              </Button>
            )}
          </div>
        </div>
      </Container>
    </section>
  )
}

/**
 * Contact — closing band with a CTA out (the LinkedIn link in the mock). Fills
 * the viewport (100vh) with its content centred both axes, and carries a bottom
 * margin equal to the footer height (`--header-h`) so the fixed Footer is
 * revealed in the gap as the reader scrolls past it.
 */
export function ContactBand({ id, contact }: { id: string; contact: Landing['contact'] }) {
  return (
    <section
      id={id}
      className="flex min-h-screen flex-col items-center justify-center mb-(--header-h)"
    >
      <Container className="flex flex-col items-center text-center">
        <h2 className="text-header text-muted-foreground tracking-tight">{contact?.header}</h2>
        {contact?.subheader && (
          <p className="mt-3 max-w-2xl text-headline mb-10">{contact.subheader}</p>
        )}
        {contact?.description && (
          <p className="mt-3 max-w-2xl text-body text-muted-foreground">{contact.description}</p>
        )}
        {contact?.ctaUrl && contact?.ctaLabel && (
          <Button asChild variant="secondary" className="mt-8">
            <Link href={contact.ctaUrl} target="_blank" rel="noopener noreferrer">
              {contact.ctaLabel}
            </Link>
          </Button>
        )}
      </Container>
    </section>
  )
}
