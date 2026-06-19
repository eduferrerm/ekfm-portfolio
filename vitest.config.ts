import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// Unit tests for pure lib/ helpers run in a plain node env (no jsdom, no Payload).
// `@` alias mirrors tsconfig so the few erased `@/payload-types` type imports and
// any future `@/`-pathed test resolve. Colocated: <module>.test.ts beside source.
export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./', import.meta.url)) },
  },
  test: {
    environment: 'node',
    include: ['{lib,features}/**/*.test.{ts,tsx}'],
  },
})
