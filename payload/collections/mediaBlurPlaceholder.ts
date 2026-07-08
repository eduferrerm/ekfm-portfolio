import type { CollectionBeforeChangeHook } from 'payload'
import sharp from 'sharp'

/**
 * Produces a tiny base64 LQIP (low-quality image placeholder) data URI from raw
 * image bytes, or null when the bytes aren't a decodable raster (SVG, PDF, an
 * undecodable upload). 16px wide is enough signal for a blurred preview; webp
 * keeps the inlined URI a few hundred bytes so it ships cheaply in the RSC
 * payload. Shared by the upload hook (fresh bytes) and the backfill script
 * (bytes refetched from Blob) so both derive blur identically.
 */
export async function blurDataURLFromBuffer(buffer: Buffer): Promise<string | null> {
  try {
    const lqip = await sharp(buffer).resize(16, null, { fit: 'inside' }).webp({ quality: 40 }).toBuffer()
    return `data:image/webp;base64,${lqip.toString('base64')}`
  } catch {
    return null
  }
}

/**
 * Stashes the blur LQIP on the Media doc's `blurDataURL` field before persisting,
 * so `next/image placeholder="blur"` can paint an instant preview while the full
 * asset optimizes on first request. This is what hides the cold Vercel image-
 * optimizer pass on a soft navigation to a never-yet-visited detail page.
 *
 * Runs only when a NEW image file is present on the write (`req.file`): re-saving
 * a doc without re-uploading (e.g. an alt-text edit) leaves the existing blur
 * untouched, and a direct `blurDataURL` set (the backfill script) passes through.
 */
export const generateBlurPlaceholder: CollectionBeforeChangeHook = async ({ data, req }) => {
  const file = req.file

  if (file?.data && file.mimetype?.startsWith('image/')) {
    data.blurDataURL = await blurDataURLFromBuffer(file.data)
  }

  return data
}
