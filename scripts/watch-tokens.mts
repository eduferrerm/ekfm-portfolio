/**
 * Watches `app/globals.css` and regenerates the token catalog on save, so the
 * /design-system viewer + `cn()` stay in sync live during development without a
 * manual command. `predev` regenerates once at startup; run this (e.g. in a second
 * terminal alongside `pnpm dev`) to keep it fresh as you edit.
 *
 * Run with: `pnpm watch:tokens`
 */
import { watch } from 'node:fs'
import path from 'node:path'

import { generateTokens } from './generate-tokens.mts'

const CSS_PATH = path.resolve(process.cwd(), 'app/globals.css')
let timer: NodeJS.Timeout | null = null

await generateTokens()
console.log('▸ watching app/globals.css for token changes…')

watch(CSS_PATH, () => {
  // Debounce — editors fire several events per save.
  if (timer) clearTimeout(timer)
  timer = setTimeout(async () => {
    try {
      await generateTokens()
      console.log(`✓ tokens regenerated (${new Date().toLocaleTimeString()})`)
    } catch (err) {
      console.error('✗ token generation failed:', err)
    }
  }, 100)
})
