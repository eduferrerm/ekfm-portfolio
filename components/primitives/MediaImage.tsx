import Image from 'next/image'

import type { Media } from '@/payload-types'
import { cn } from '@/lib/utils'

/**
 * Renders a Payload Media upload as a next/image. Bytes live in Vercel Blob
 * (remotePatterns whitelists *.public.blob.vercel-storage.com).
 *
 * Intrinsic width/height come from the upload metadata (sharp) to set the
 * aspect ratio; constrain display size via `className` (e.g. `h-12 w-auto`).
 * Falls back to a square hint if metadata is missing, paired with
 * object-contain so a wrong guess letterboxes rather than distorts. Renders
 * nothing if the relationship was passed unpopulated (a number/null).
 *
 * When the asset carries a `blurDataURL` (base64 LQIP baked at upload time),
 * it's used as a `placeholder="blur"` so a soft navigation to a not-yet-
 * optimized image shows an instant preview instead of a blank box while the
 * Vercel optimizer does its first pass. `onLoad` forwards next/image's real-
 * image load event (fires on the asset, not the blur) so callers can defer
 * reveal animations until the full image is present.
 */
export function MediaImage({
  media,
  className,
  sizes,
  priority,
  onLoad,
}: {
  media?: Media | number | null
  className?: string
  sizes?: string
  priority?: boolean
  onLoad?: () => void
}) {
  if (!media || typeof media !== 'object' || !media.url) return null

  const blur = media.blurDataURL

  return (
    <Image
      src={media.url}
      alt={media.alt ?? ''}
      width={media.width ?? 256}
      height={media.height ?? 256}
      sizes={sizes}
      priority={priority}
      placeholder={blur ? 'blur' : 'empty'}
      blurDataURL={blur ?? undefined}
      onLoad={onLoad}
      className={cn('object-contain', className)}
    />
  )
}
