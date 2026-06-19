import { experienceNavItems } from '@/features/experience/queries'
import { sectionNav } from '@/features/landing/queries'
import { buildSearchDataset } from '@/lib/search/dataset'

import { SectionShell } from '../_chrome/SectionShell'

/**
 * Shared layout for the experience section: the global SectionShell (top bar +
 * persistent aside + mobile menu) wrapping the server-rendered per-role detail
 * route. The aside sub-nav lists every role (newest first); the shell is not
 * remounted across soft-navigations, giving the section its SPA feel.
 */
export default async function ExperienceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sections, items, documents] = await Promise.all([
    sectionNav(),
    experienceNavItems(),
    buildSearchDataset(),
  ])

  return (
    <SectionShell active="experience" sections={sections} items={items} documents={documents}>
      {children}
    </SectionShell>
  )
}
