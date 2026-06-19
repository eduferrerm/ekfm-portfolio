import { buildSearchDataset } from '@/lib/search/dataset'
import { slugify } from '@/lib/slugify'
import type { Visitor, VisitorContent } from '@/payload-types'
import { DearCompanySection } from '@/features/visitor/DearCompanySection'
import { buildVisitorSearchContext } from '@/features/search-palette/visitorContext'
import { WelcomeBanner } from '@/features/visitor/WelcomeBanner'

import { LandingNav } from './LandingNav'
import { HeroBand, TldrBand, LandingSectionBand, MoreAboutMeBand, ContactBand } from './bands'
import { experienceCards, experienceYearsLabel, landingGlobal, portfolioCards } from './queries'

/** Anchor for the visitor-only Dear Company band (matches DearCompanySection's id). */
const DEAR_COMPANY_ID = 'dear-company'

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
  const [landing, pCards, eCards, searchDocs, yearsLabel] = await Promise.all([
    landingGlobal(),
    portfolioCards(),
    experienceCards(),
    buildSearchDataset(),
    experienceYearsLabel(), // union-of-intervals YoE for the TL;DR band
  ])

  const sections = landing.sections ?? []
  const visitorSearch = visitor ? buildVisitorSearchContext(visitor) : null
  const dearCompanyNav = visitorContent?.constants?.dearCompanyNav || 'Dear Company'
  const navItems = [
    ...(visitor ? [{ label: dearCompanyNav, slug: DEAR_COMPANY_ID }] : []),
    ...sections.map((s) => ({ label: s.navLabel, slug: slugify(s.navLabel) })),
  ]

  return (
    <main>
      {visitor && (
        <div className="mx-auto w-full max-w-5xl px-6 pt-6">
          <WelcomeBanner
            company={visitor.company}
            logo={visitor.companyLogo}
            greeting={visitorContent?.welcomeGreeting}
          />
        </div>
      )}

      <LandingNav items={navItems} documents={searchDocs} visitorSearch={visitorSearch} />

      <HeroBand hero={landing.hero} />

      {visitor && visitorContent && (
        <div className="mx-auto w-full max-w-5xl px-6 py-20">
          <DearCompanySection visitor={visitor} content={visitorContent} />
        </div>
      )}

      {sections.map((section) => {
        const id = slugify(section.navLabel)
        switch (section.key) {
          case 'tldr':
            return <TldrBand key={section.id} id={id} tldr={landing.tldr} yearsLabel={yearsLabel} />
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
            return <MoreAboutMeBand key={section.id} id={id} data={landing.moreAboutMe} />
          case 'contact':
            return <ContactBand key={section.id} id={id} contact={landing.contact} />
          default:
            return null
        }
      })}
    </main>
  )
}
