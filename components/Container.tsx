import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

/**
 * The site's content column — the single source of truth for page max-width +
 * horizontal padding (centered, capped at 1200px from desktop up, `px-6` gutter).
 * Shared by the nav, the landing bands, the inner-page body, and the search
 * overlay so chrome and content always align to the same column (and stay
 * aligned through future edits). Pass `className` for per-use spacing (e.g.
 * vertical padding) or flex alignment.
 */
export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('mx-auto w-full max-w-[1200px] px-6', className)}>{children}</div>
}
