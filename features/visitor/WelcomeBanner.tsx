import { MediaImage } from '@/components/primitives/MediaImage'
import type { Media } from '@/payload-types'

/**
 * Personalized greeting shown at the top of /dear/[company]: the company avatar,
 * "Welcome {company}", and a fixed greeting from the VisitorContent global.
 */
export function WelcomeBanner({
  company,
  logo,
  greeting,
}: {
  company: string
  logo?: Media | number | null
  greeting?: string | null
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-primary px-4 py-3 text-primary-foreground">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500">
        <MediaImage media={logo} className="h-full w-full object-cover" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">Welcome {company}</p>
        {greeting && <p className="truncate text-xs opacity-80">{greeting}</p>}
      </div>
    </div>
  )
}
