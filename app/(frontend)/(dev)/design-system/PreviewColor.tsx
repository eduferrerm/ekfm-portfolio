'use client'

import { useEffect, useState } from 'react'

import { resolveCaption } from '@/lib/design-system/resolveTokens'
import type { DSThemeColor } from '@/lib/design-system/tokens'
import { cn } from '@/lib/utils'

/**
 * One colour swatch in the viewer. The chip is painted by the token's own
 * Tailwind utility; the caption (which stock stop a role maps to, or a palette
 * stop's resolved value) is read live off `globals.css` after mount — never a
 * hand-copied literal, so it can't drift from the SSOT.
 */
export function PreviewColor({
  token,
  caption,
}: {
  token: DSThemeColor
  caption: 'provenance' | 'value'
}) {
  const [value, setValue] = useState<string | null>(null)

  useEffect(() => {
    setValue(resolveCaption(token.cssVar, caption))
  }, [token.cssVar, caption])

  return (
    <div className="flex flex-col gap-2">
      <div className={cn('h-16 rounded-lg border border-border', token.swatch)} />
      <div>
        <div className="text-meta-bold text-foreground">{token.name}</div>
        <div className="text-meta break-words text-muted-foreground">{value ?? '…'}</div>
      </div>
    </div>
  )
}
