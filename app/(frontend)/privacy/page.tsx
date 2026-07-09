import type { Metadata } from 'next'
import Link from 'next/link'

import { Brand } from '@/components/Brand'
import { Container } from '@/components/Container'
import { FooterBar } from '@/components/FooterBar'

// Static transparency notice — the GDPR disclosure half of the "storage-free +
// legitimate interest" analytics posture (see lib/posthog/provider.tsx). No CMS
// dependency: this is fixed first-party copy, not editorial content. ISR daily
// backstop keeps it aligned with the rest of the tree's cadence.
export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Privacy — EKFM',
  description: 'What this site measures, and why. First-party, aggregate, storage-free analytics.',
}

/**
 * Privacy notice — the transparency half of the analytics posture. Capturing is
 * opt-in (nothing until the CookieConsent banner is accepted) over storage-free,
 * memory-only analytics; this page discloses that, plus the legitimate-interest
 * basis for the small amount of personal data (a transient IP for coarse geo +
 * bot filtering) processed once a visitor accepts. Linked from the site footer,
 * so it's reachable from every page.
 */
export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="mx-auto w-full max-w-[1920px] flex-1 pb-20">
        <header>
          <Container className="flex h-(--header-h) items-center">
            <Brand />
          </Container>
        </header>

        <Container className="max-w-[720px] py-10">
          <h1 className="text-header mb-3">Privacy</h1>
          <p className="text-lead text-muted-foreground mb-10">
            The short version: nothing is tracked unless you accept, there are no tracking cookies,
            no cross-session tracking, no ads, and no third parties. When you do accept, this site
            measures anonymous, aggregate usage so I can tell real visits apart from bots — nothing
            more.
          </p>

          <section className="mb-8">
            <h2 className="text-subheader text-label mb-2">What I collect</h2>
            <p className="text-body text-foreground mb-3">
              First-party, aggregate analytics via PostHog, configured to be as light as possible:
            </p>
            <ul className="text-body text-foreground space-y-2 pl-5 [list-style:disc]">
              <li>
                A handful of named events — page views, section views, search queries, and clicks on
                interactive diagrams — used to understand what’s useful.
              </li>
              <li>
                No automatic capture of everything you click, no session recording or screen replay,
                and no advertising or marketing profiles.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-subheader text-label mb-2">Your choice, and what’s stored</h2>
            <p className="text-body text-foreground mb-3">
              On your first visit you’ll see a short banner asking whether to allow analytics.{' '}
              <span className="text-ui-bold">Nothing is measured until you accept</span> — decline
              and no events are ever sent. The only thing saved to your device is that single yes/no
              choice, so you aren’t asked again.
            </p>
            <p className="text-body text-foreground">
              If you accept, the analytics themselves run in{' '}
              <span className="text-ui-bold">memory only</span> — no tracking cookie and no
              persistent <code className="text-card-body">localStorage</code> identifier are
              written. The trade-off is deliberate: I can’t recognise you across days, and I’d
              rather not.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-subheader text-label mb-2">IP address and location</h2>
            <p className="text-body text-foreground">
              Your IP address is processed transiently to derive a coarse, city-level location and
              to separate genuine visits from automated/datacenter traffic. It is{' '}
              <span className="text-ui-bold">not stored against any identity</span> and isn’t used
              to build a profile of you. The lawful basis for this limited processing is{' '}
              <span className="text-ui-bold">legitimate interest</span> — understanding, in
              aggregate, how a personal portfolio is used — balanced against a minimal, first-party,
              EU-region setup with automatic capture, session recording, and profiles all switched
              off.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-subheader text-label mb-2">Do Not Track</h2>
            <p className="text-body text-foreground">
              If your browser sends a Do-Not-Track signal, analytics stay off entirely. This is
              offered as a courtesy — it goes beyond what’s required.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-subheader text-label mb-2">Questions</h2>
            <p className="text-body text-foreground">
              This is a personal portfolio built and operated by Eduardo Ferrer. If you have any
              questions about what’s described here, get in touch via the contact section on the{' '}
              <Link href="/#contact" className="text-primary underline underline-offset-2">
                home page
              </Link>
              .
            </p>
          </section>
        </Container>
      </div>
      <FooterBar lead="home" />
    </div>
  )
}
