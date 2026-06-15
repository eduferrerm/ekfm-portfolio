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
 */
export function MediaImage({
  media,
  className,
  sizes,
  priority,
}: {
  media?: Media | number | null
  className?: string
  sizes?: string
  priority?: boolean
}) {
  if (!media || typeof media !== 'object' || !media.url) return null

  return (
    <Image
      src={media.url}
      alt={media.alt ?? ''}
      width={media.width ?? 256}
      height={media.height ?? 256}
      sizes={sizes}
      priority={priority}
      className={cn('object-contain', className)}
    />
  )
}
