import 'server-only'

import { getPayload } from 'payload'
import config from '@payload-config'

import { experienceHref, portfolioHref } from '@/lib/routes'
import { slugify } from '@/lib/slugify'

import type { SearchDocument } from './types'

/**
 * Builds the search dataset server-side via the Payload Local API (no HTTP).
 *
 * Called at build/ISR time so the full corpus ships to the client as static
 * JSON; the browser then builds the Fuse index from it (see useSearchIndex).
 * Keep payloads lean — only fields the index/preview need.
 */
export async function buildSearchDataset(): Promise<SearchDocument[]> {
  const payload = await getPayload({ config })

  const [portfolio, experience, landing] = await Promise.all([
    payload.find({ collection: 'portfolio', limit: 1000, depth: 1 }),
    payload.find({ collection: 'experience', limit: 1000, depth: 1 }),
    // Keyword docs were dropped from the corpus in Phase 6 (Open #6): they had
    // no real destination once the navigational `target` mechanism was retired,
    // and a keyword's recall value already folds into the content it tags —
    // descriptor labels into keywords[], descriptor + searchKeyword synonyms into
    // aliases[]. Landing sections own navigation now (each emits a /#slug doc).
    // depth:1 populates sections[].searchKeywords so their recall terms fold in.
    payload.findGlobal({ slug: 'landing', depth: 1 }),
  ])

  // Resolved keyword (depth:1 populates scope/craft relationships into objects).
  type Keyword = number | string | { label?: string; aliases?: (string | null)[] | null }

  // Flatten scope + craft (in attach order — scope first) into the doc's
  // keyword labels.
  const keywordLabels = (...groups: Array<Keyword[] | null | undefined>): string[] =>
    groups
      .flatMap((items) => items ?? [])
      .map((k) => (typeof k === 'object' && k ? k.label : undefined))
      .filter((label): label is string => Boolean(label))

  // Collect the recruiter-term synonyms off those same keywords for search recall.
  const keywordAliases = (...groups: Array<Keyword[] | null | undefined>): string[] =>
    groups
      .flatMap((items) => items ?? [])
      .flatMap((k) => (typeof k === 'object' && k ? (k.aliases ?? []) : []))
      .filter((alias): alias is string => Boolean(alias))

  // depth:1 populates a Media relationship into an object carrying `url`; an
  // unpopulated id (or missing media) yields no thumbnail.
  const mediaUrl = (value: unknown): string | undefined =>
    typeof value === 'object' && value && 'url' in value && typeof value.url === 'string'
      ? value.url
      : undefined

  const docs: SearchDocument[] = [
    ...portfolio.docs.map((doc) => ({
      id: `portfolio:${doc.id}`,
      type: 'portfolio' as const,
      // Card contract (shared with the visitor relevant-content cards):
      // label = category, name = the item's short name (eyebrow). title carries
      // the headline for search but the row shows the eyebrow.
      label: 'Feature',
      name: doc.eyebrow,
      thumbnail: mediaUrl(doc.thumbnail),
      title: doc.title,
      description: doc.summary ?? undefined,
      // keywords[] = rendered descriptors only. searchKeywords (labels + their
      // aliases) ride in aliases[], which is search-fed but never rendered.
      keywords: keywordLabels(doc.scope, doc.craft),
      aliases: [
        ...keywordAliases(doc.scope, doc.craft, doc.searchKeywords),
        ...keywordLabels(doc.searchKeywords),
      ],
      href: portfolioHref(doc.slug),
    })),
    ...experience.docs.map((doc) => ({
      id: `experience:${doc.id}`,
      type: 'experience' as const,
      label: 'Experience',
      name: doc.company,
      thumbnail: mediaUrl(doc.companyLogo),
      // title holds role + company so "IC5" matches a row that displays "Meta".
      title: `${doc.role} · ${doc.company}`,
      keywords: keywordLabels(doc.scope, doc.craft),
      aliases: [
        ...keywordAliases(doc.scope, doc.craft, doc.searchKeywords),
        ...keywordLabels(doc.searchKeywords),
      ],
      href: experienceHref(doc.slug),
    })),
    ...(landing.sections ?? []).map((section) => {
      const slug = slugify(section.navLabel)
      return {
        id: `section:${slug}`,
        type: 'section' as const,
        label: 'Section',
        name: section.navLabel,
        title: section.navLabel,
        keywords: [],
        // Free-text nav synonyms + the section's searchOnly keywords (label +
        // aliases). Same recall fold content uses; sections render no keywords[].
        aliases: [
          ...(section.aliases ?? []).filter((alias): alias is string => Boolean(alias)),
          ...keywordAliases(section.searchKeywords),
          ...keywordLabels(section.searchKeywords),
        ],
        // Bare fragment, not `/#slug`: the assembled landing renders these
        // anchors on BOTH `/` and `/dear/[company]`, so the palette resolves the
        // fragment against the current route (see SearchPalette) — a visitor
        // stays on their personalized page instead of bouncing to `/`.
        href: `#${slug}`,
      }
    }),
  ]

  return docs
}
