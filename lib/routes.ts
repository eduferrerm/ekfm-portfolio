/**
 * Single source of truth for the public route shape of the two linkable
 * collections (`/portfolio/[slug]`, `/experience/[slug]`). A missing slug falls
 * back to the collection index — landing cards link there until a piece is
 * slugged. Keep every route literal here, not hand-built at the call site.
 */
/**
 * Prefix a root-relative app path with a visitor scope (e.g. '/dear/ashby') so a
 * visitor's navigation stays inside their mirrored tree. The ONE place link
 * scoping happens — every href builder funnels through here, so there is a single
 * spot to reason about scope leaks. An empty scope (the default — the canonical
 * site) returns the path unchanged; pure anchors (#id) and absolute URLs pass
 * through untouched.
 */
export function scopeHref(href: string, scope = ''): string {
  if (!scope || href.startsWith('#') || /^[a-z][a-z0-9+.-]*:/i.test(href)) return href
  return `${scope}${href}`
}

export function portfolioHref(slug?: string | null, scope = ''): string {
  return scopeHref(slug ? `/portfolio/${slug}` : '/portfolio', scope)
}

export function experienceHref(slug?: string | null, scope = ''): string {
  return scopeHref(slug ? `/experience/${slug}` : '/experience', scope)
}
