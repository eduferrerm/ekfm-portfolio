import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * The visitor mirror (`/dear/[company]/...`) must stay in lock-step with the
 * canonical site: every canonical section route needs a scoped twin, or visitors
 * silently fall out of their scope (404 or leak to the public site). This derives
 * the canonical sections from the filesystem — so adding a new section without its
 * scoped twin fails here instead of in front of a recruiter.
 */
const APP = join(process.cwd(), 'app', '(frontend)')
const SCOPED = join(APP, 'dear', '[company]')

/** Canonical first-level section routes: a dir with a page.tsx, minus the mirror
 * itself and non-route (underscore-prefixed) dirs. */
function sectionDirs(): string[] {
  return readdirSync(APP).filter((name) => {
    if (name.startsWith('_') || name === 'dear') return false
    const dir = join(APP, name)
    return statSync(dir).isDirectory() && existsSync(join(dir, 'page.tsx'))
  })
}

/** Sections with a [slug] detail page (the routed ones) need a scoped detail twin. */
function routedSectionDirs(): string[] {
  return sectionDirs().filter((seg) => existsSync(join(APP, seg, '[slug]', 'page.tsx')))
}

describe('visitor mirror route parity', () => {
  it('finds the canonical section routes', () => {
    expect(sectionDirs().length).toBeGreaterThan(0)
  })

  it.each(sectionDirs())('canonical /%s has a scoped /dear/[company] twin', (seg) => {
    expect(existsSync(join(SCOPED, seg, 'page.tsx'))).toBe(true)
  })

  it.each(routedSectionDirs())('routed /%s/[slug] has a scoped /dear/[company] twin', (seg) => {
    expect(existsSync(join(SCOPED, seg, '[slug]', 'page.tsx'))).toBe(true)
  })

  it('the mirror is guarded by a layout that declares noindex', () => {
    const layout = join(SCOPED, 'layout.tsx')
    expect(existsSync(layout)).toBe(true)
    expect(readFileSync(layout, 'utf8')).toMatch(/robots[\s\S]*index:\s*false/)
  })
})
