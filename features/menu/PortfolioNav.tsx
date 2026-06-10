'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
  { href: '/portfolio', label: 'Work' },
  { href: '/experience', label: 'Experience' },
  { href: '/tldr', label: 'TL;DR' },
  { href: '/contact', label: 'Contact' },
] as const

/**
 * Persistent portfolio navigation. Rendered inside the portfolio shared layout
 * so it survives App Router soft-navigations (the SPA feel). Highlights the
 * active section by pathname prefix.
 */
export function PortfolioNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1" aria-label="Portfolio sections">
      {LINKS.map(({ href, label }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`)
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={
              active
                ? 'rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-foreground'
                : 'rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent/50 hover:text-foreground'
            }
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
