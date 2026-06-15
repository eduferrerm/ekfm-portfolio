import 'server-only'

import { getPayload } from 'payload'
import config from '@payload-config'

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

  const [portfolio, experience, keywords] = await Promise.all([
    payload.find({ collection: 'portfolio', limit: 1000, depth: 1 }),
    payload.find({ collection: 'experience', limit: 1000, depth: 1 }),
    // Search-only keywords never stand on their own as a result — they exist to
    // lift the content they're attached to (via searchKeywords). Excluded here.
    // (Phase 6 will re-admit navigational searchOnly keywords that carry a target.)
    payload.find({
      collection: 'keywords',
      limit: 1000,
      depth: 0,
      where: { searchOnly: { not_equals: true } },
    }),
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

  const docs: SearchDocument[] = [
    ...portfolio.docs.map((doc) => ({
      id: `portfolio:${doc.id}`,
      type: 'portfolio' as const,
      title: doc.title,
      description: doc.summary ?? undefined,
      // keywords[] = rendered descriptors only. searchKeywords (labels + their
      // aliases) ride in aliases[], which is search-fed but never rendered.
      keywords: keywordLabels(doc.scope, doc.craft),
      aliases: [
        ...keywordAliases(doc.scope, doc.craft, doc.searchKeywords),
        ...keywordLabels(doc.searchKeywords),
      ],
      href: `/portfolio/${doc.slug}`,
    })),
    ...experience.docs.map((doc) => ({
      id: `experience:${doc.id}`,
      type: 'experience' as const,
      title: `${doc.role} · ${doc.company}`,
      keywords: keywordLabels(doc.scope, doc.craft),
      aliases: [
        ...keywordAliases(doc.scope, doc.craft, doc.searchKeywords),
        ...keywordLabels(doc.searchKeywords),
      ],
      href: '/experience',
    })),
    ...keywords.docs.map((doc) => ({
      id: `keyword:${doc.id}`,
      type: 'keyword' as const,
      title: doc.label,
      keywords: [],
      aliases: (doc.aliases ?? []).filter((alias): alias is string => Boolean(alias)),
      href: `/portfolio?keyword=${encodeURIComponent(doc.slug)}`,
    })),
  ]

  return docs
}
