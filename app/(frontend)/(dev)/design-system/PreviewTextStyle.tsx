'use client'

import { useEffect, useRef, useState } from 'react'

import { resolveTextStyle } from '@/lib/design-system/resolveTokens'
import type { DSThemeTextStyle } from '@/lib/design-system/tokens'
import { cn } from '@/lib/utils'

const SAMPLE = 'The quick brown fox jumps over the lazy dog'

/**
 * One row of the type scale: the live caption above the rendered sample. The
 * sample's element IS the measurement target — caption and specimen are the same
 * DOM, so what you read is what you see, and it can never drift from the
 * `@utility text-*` definition in globals.css. Fluid `clamp()` roles re-read on
 * resize so the reported px tracks the viewport.
 */
export function PreviewTextStyle({
  style,
  className,
}: {
  style: DSThemeTextStyle
  className?: string
}) {
  const ref = useRef<HTMLParagraphElement>(null)
  const [spec, setSpec] = useState<string | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => setSpec(resolveTextStyle(el))
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <p className="text-meta text-muted-foreground">
        {style.utility}
        {spec ? ` · ${spec}` : ''}
      </p>
      <p ref={ref} className={cn(style.utility, 'text-foreground')}>
        {style.sample ?? SAMPLE}
      </p>
    </div>
  )
}
