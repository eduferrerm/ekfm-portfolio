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
 * position (brand is 0, links follow). The SAME ascending cadence runs in both
 * directions — enter slides down, exit slides up — so the first element always
 * leads and the retract starts immediately (no dead-time before it moves).
 */
export const STAGGER_DELAYS = [
  'delay-[0ms]',
  'delay-[40ms]',
  'delay-[80ms]',
  'delay-[120ms]',
  'delay-[160ms]',
  'delay-[200ms]',
  'delay-[240ms]',
]
