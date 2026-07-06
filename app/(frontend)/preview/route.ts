import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Enter draft mode, then redirect to the target app path so the render reads
 * working drafts (see lib/preview). Linked from a collection's "Preview" button
 * (admin.preview → `/preview?path=…`).
 *
 * Auth is the Payload session cookie already on the request — the button opens
 * in the logged-in admin browser, so no shared secret to leak; a logged-out
 * request is rejected. `path` is constrained to a same-origin app route to block
 * an open redirect (`//evil.com`, `javascript:`).
 */
export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url)
  const path = searchParams.get('path')

  if (!path || !path.startsWith('/') || path.startsWith('//')) {
    return new Response('Invalid preview path', { status: 400 })
  }

  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })
  if (!user) return new Response('Unauthorized', { status: 401 })

  ;(await draftMode()).enable()
  redirect(path)
}
