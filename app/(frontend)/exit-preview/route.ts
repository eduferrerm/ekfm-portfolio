import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

/**
 * Leave draft mode and return to the given app path (or home). Public: disabling
 * preview reveals nothing, so no auth gate — worst case a visitor turns off a
 * cookie they never had. `path` is constrained to a same-origin app route.
 */
export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url)
  const path = searchParams.get('path')
  const dest = path && path.startsWith('/') && !path.startsWith('//') ? path : '/'

  ;(await draftMode()).disable()
  redirect(dest)
}
