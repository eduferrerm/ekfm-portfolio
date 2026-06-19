/**
 * Single source of truth for the public route shape of the two linkable
 * collections (`/portfolio/[slug]`, `/experience/[slug]`). A missing slug falls
 * back to the collection index — landing cards link there until a piece is
 * slugged. Keep every route literal here, not hand-built at the call site.
 */
export function portfolioHref(slug?: string | null): string {
  return slug ? `/portfolio/${slug}` : '/portfolio'
}

export function experienceHref(slug?: string | null): string {
  return slug ? `/experience/${slug}` : '/experience'
}
