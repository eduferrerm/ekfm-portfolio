import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

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
 * element" rule — while never colliding with a colour. Trade-off: a role won't
 * dedupe against a piecemeal `font-weight`/`font-family` override, which is fine
 * (pick a different role instead of overriding a role's weight).
 *
 * Keep this list in sync with the `@utility text-*` blocks in globals.css.
 */
const TYPE_ROLES = [
  'hero-headline',
  'header',
  'subtitle',
  'subheader',
  'lead',
  'body',
  'list',
  'ui',
  'ui-bold',
  'card-title',
  'card-body',
  'eyebrow',
  'hero-list',
  'nav',
  'aside',
  'meta',
  'meta-bold',
]

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: TYPE_ROLES }],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
