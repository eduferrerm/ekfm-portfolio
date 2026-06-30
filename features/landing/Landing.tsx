import { buildSearchDataset } from '@/lib/search/dataset'
import { DEAR_COMPANY_ID } from '@/lib/nav'
import { dearHref } from '@/lib/routes'
import { slugify } from '@/lib/slugify'
import type { Visitor, VisitorContent } from '@/payload-types'
import { DearCompanySection } from '@/features/visitor/DearCompanySection'
import { buildVisitorSearchContext } from '@/features/search-palette/visitorContext'
import { WelcomeBanner } from '@/features/visitor/WelcomeBanner'

import { LandingNav } from './LandingNav'
import { Footer } from './Footer'
import { SectionViewTracker } from './SectionViewTracker'
import { HeroBand, TldrBand, LandingSectionBand, MoreAboutMeBand, ContactBand } from './bands'
import { moreAboutMeCta } from './projections'
import { experienceCards, experienceYearsLabel, landingGlobal, portfolioCards } from './queries'

/**
 * The assembled landing, composed from the Landing global + collection
 * projections. Visitor-aware: `/` renders it plain; `/dear/[company]` passes a
 * `visitor` (+ the VisitorContent global) which mounts the welcome banner and
 * weaves the Dear Company band in after the hero. One SSOT, one component — no
 * content is duplicated between the two routes.
 *
 * Render order is fixed in code (each band is a bespoke composition); the nav,
 * the band anchor ids, and the search docs all derive from `Landing.sections[]`,
 * so they stay in sync without a code manifest.
 */
export async function Landing({
  visitor,
  visitorContent,
}: {
  visitor?: Visitor | null
  visitorContent?: VisitorContent | null
}) {
  // On a visitor page, scope every internal link to the company's mirror so
  // navigation never falls out of the visitor experience.
  const scope = visitor?.slug ? dearHref(visitor.slug) : ''
  const [landing, pCards, eCards, searchDocs, yearsLabel] = await Promise.all([
    landingGlobal(),
    portfolioCards(scope),
    experienceCards(scope),
    buildSearchDataset(),
    experienceYearsLabel(), // union-of-intervals YoE for the TL;DR band
  ])

  const sections = landing.sections ?? []
  const visitorSearch = visitor ? buildVisitorSearchContext(visitor) : null
  const navItems = [
    ...(visitor ? [{ label: `Dear ${visitor.company}`, slug: DEAR_COMPANY_ID }] : []),
    ...sections.map((s) => ({ label: s.navLabel, slug: slugify(s.navLabel) })),
  ]

  return (
    <>
      {/* Opaque, lifted above the fixed Footer so it reads as a reveal: the page
          slides over the footer, exposing it only through Contact's bottom gap. */}
      <main className="relative z-10 bg-background">
        {/* Scroll-reach analytics: fires section_viewed once per band as it's reached. */}
        <SectionViewTracker sections={sections.map((s) => slugify(s.navLabel))} />
        <LandingNav items={navItems} documents={searchDocs} visitorSearch={visitorSearch} />

        <HeroBand
          hero={landing.hero}
          navItems={navItems}
          banner={
            visitor ? (
              <WelcomeBanner
                company={visitor.company}
                logo={visitor.companyLogo}
                greeting={visitorContent?.welcomeGreeting}
              />
            ) : undefined
          }
        />

        {visitor && visitorContent && (
          <DearCompanySection visitor={visitor} content={visitorContent} />
        )}

        {sections.map((section) => {
          const id = slugify(section.navLabel)
          switch (section.key) {
            case 'tldr':
              return (
                <TldrBand key={section.id} id={id} tldr={landing.tldr} yearsLabel={yearsLabel} />
              )
            case 'experience':
              return (
                <LandingSectionBand
                  key={section.id}
                  id={id}
                  section={landing.experience}
                  cards={eCards}
                  ctaLabel={landing.experience?.ctaLabel || 'View Role'}
                />
              )
            case 'portfolio':
              return (
                <LandingSectionBand
                  key={section.id}
                  id={id}
                  section={landing.portfolio}
                  cards={pCards}
                  ctaLabel={landing.portfolio?.ctaLabel || 'Feature Details'}
                />
              )
            case 'moreAboutMe':
              return (
                <MoreAboutMeBand
                  key={section.id}
                  id={id}
                  data={landing.moreAboutMe}
                  cta={moreAboutMeCta(landing.moreAboutMe?.teaser, scope)}
                />
              )
            case 'contact':
              return <ContactBand key={section.id} id={id} contact={landing.contact} />
            default:
              return null
          }
        })}
      </main>

      <Footer />
    </>
  )
}
