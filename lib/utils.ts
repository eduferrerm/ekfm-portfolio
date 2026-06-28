import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

import { textRoleNames } from '@/lib/design-system/tokens'

/**
 * Our semantic type roles (the `@utility text-*` scale in globals.css) share the
 * `text-` prefix with colour utilities. tailwind-merge doesn't know our custom
 * utilities, and its fallback files any unrecognised `text-X` under `text-color`,
 * so `cn('text-nav', 'text-muted-foreground')` reads as two colours and silently
 * drops the *role*. (This is inherent to Tailwind overloading `text-` for size +
 * colour — twMerge only separates its OWN `text-sm` vs `text-red-500` because they
 * are hardcoded.)
 *
 * A twMerge class group is a *conflict set* ("only one of these wins"), not a claim
 * about which CSS property a class sets. Registering the roles in the `font-size`
 * group models them as the element's single text-identity axis: they then dedupe
 * against each other and against raw sizes (`text-sm`) — the "one type role per
 * element" rule — while never colliding with a colour.
 *
 * The role list (`textRoleNames`) is derived from the design-system catalog, which
 * is generated from globals.css — so there is no hand-maintained list to keep in
 * sync. Add a `@utility text-*` in globals.css, run `pnpm generate:tokens`, done.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: textRoleNames }],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
