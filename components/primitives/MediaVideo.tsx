import type { Media } from '@/payload-types'
import { cn } from '@/lib/utils'

/**
 * Renders a Payload Media upload as an inline showcase reel. Autoplay requires
 * `muted` (browser policy); loops silently as ambient motion. Reels are
 * authored lean (<4.5MB) so eager loading is acceptable, but preload stays at
 * `metadata` to avoid pulling the whole file before it scrolls into view.
 * Renders nothing if the relationship was passed unpopulated.
 */
export function MediaVideo({
  media,
  className,
}: {
  media?: Media | number | null
  className?: string
}) {
  if (!media || typeof media !== 'object' || !media.url) return null

  return (
    <video
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={media.alt ?? undefined}
      className={cn('w-full rounded-lg', className)}
    >
      <source src={media.url} type={media.mimeType ?? undefined} />
    </video>
  )
}
