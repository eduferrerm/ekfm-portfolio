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
    payload.find({ collection: 'keywords', limit: 1000, depth: 0 }),
  ])

  const keywordLabels = (
    items: Array<number | string | { label?: string }> | null | undefined,
  ): string[] =>
    (items ?? [])
      .map((k) => (typeof k === 'object' && k ? k.label : undefined))
      .filter((label): label is string => Boolean(label))

  const docs: SearchDocument[] = [
    ...portfolio.docs.map((doc) => ({
      id: `portfolio:${doc.id}`,
      type: 'portfolio' as const,
      title: doc.title,
      description: doc.summary ?? undefined,
      keywords: keywordLabels(doc.keywords),
      href: `/portfolio/${doc.slug}`,
    })),
    ...experience.docs.map((doc) => ({
      id: `experience:${doc.id}`,
      type: 'experience' as const,
      title: `${doc.role} · ${doc.company}`,
      keywords: keywordLabels(doc.keywords),
      href: '/experience',
    })),
    ...keywords.docs.map((doc) => ({
      id: `keyword:${doc.id}`,
      type: 'keyword' as const,
      title: doc.label,
      keywords: [],
      href: `/portfolio?keyword=${encodeURIComponent(doc.slug)}`,
    })),
  ]

  return docs
}
