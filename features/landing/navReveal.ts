/**
 * Coupling point between the in-hero nav copy (rendered in the hero band) and the
 * sticky nav that watches it. The hero band tags its nav copy with this attribute;
 * the client `StickyNavReveal` finds it via IntersectionObserver to know when the
 * in-hero copy has scrolled out of view. A data-attribute (not an id) avoids any
 * collision with the slug-based section anchors and stays non-navigable.
 */
export const HERO_NAV_ATTR = 'data-hero-nav'
export const HERO_NAV_SELECTOR = `[${HERO_NAV_ATTR}]`

/**
 * Per-item reveal delays for the staggered nav animation. Literal Tailwind
 * arbitrary values (not computed) so the JIT emits them; index = sequence
 * position (brand is 0, links follow). Reversed on hide so the group retracts in
 * the same cadence, inverted.
 */
export const STAGGER_DELAYS = [
  'delay-[0ms]',
  'delay-[60ms]',
  'delay-[120ms]',
  'delay-[180ms]',
  'delay-[240ms]',
  'delay-[300ms]',
  'delay-[360ms]',
]
