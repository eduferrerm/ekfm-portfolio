'use client'

import { usePathname } from 'next/navigation'

/**
 * Fixed indicator shown on every frontend page while draft mode is on (gated by
 * `isPreview()` in the frontend layout). Draft mode is an otherwise-invisible,
 * browser-wide cookie, so without this it's easy to mistake a preview render for
 * the live site. "Exit" is a plain anchor (full navigation, not soft nav) to the
 * `/exit-preview` route handler, which clears the cookie and returns to the SAME
 * path — now rendered from published content.
 */
export function PreviewBanner() {
  const pathname = usePathname()
  return (
    <div className="fixed inset-x-0 bottom-4 z-[200] flex justify-center px-4">
      <div className="flex items-center gap-3 rounded-full bg-amber-400 px-4 py-2 text-sm font-medium text-amber-950 shadow-lg">
        <span aria-hidden>●</span>
        <span>Preview — showing unpublished drafts</span>
        <a
          href={`/exit-preview?path=${encodeURIComponent(pathname)}`}
          className="rounded-full bg-amber-950/10 px-3 py-0.5 underline underline-offset-2 hover:bg-amber-950/20"
        >
          Exit
        </a>
      </div>
    </div>
  )
}
