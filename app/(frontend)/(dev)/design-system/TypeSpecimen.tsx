'use client'

import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

const SAMPLE = 'The quick brown fox jumps over the lazy dog'

/**
 * Read the rendered type spec straight off the DOM via `getComputedStyle`, so the
 * caption is the truth the browser resolved — it can never drift from the
 * `@utility text-*` definitions in globals.css the way a hand-maintained literal
 * can (the old hero caption claimed `capitalize` for a role that has no transform).
 * Fluid `clamp()` roles report their CURRENT rendered px and re-read on resize.
 */
function readSpec(el: HTMLElement): string {
  const cs = getComputedStyle(el)
  const fontSize = parseFloat(cs.fontSize)
  const lineHeightPx = parseFloat(cs.lineHeight)

  const family = /condensed/i.test(cs.fontFamily) ? 'Condensed' : 'Roboto'

  const weight = cs.fontWeight
  const weightLabel = weight === '500' ? 'Medium 500' : weight === '700' ? 'Bold 700' : weight

  const size = Math.round(fontSize)
  const lh = Number.isFinite(lineHeightPx)
    ? `LH ${Math.round((lineHeightPx / fontSize) * 100)}%`
    : `LH ${cs.lineHeight}`

  const transform = cs.textTransform !== 'none' ? cs.textTransform : null

  return [family, weightLabel, String(size), lh, transform].filter(Boolean).join(' · ')
}

/**
 * One row of the type-scale specimen: the live caption above the rendered sample.
 * The sample's element is the measurement target — caption and specimen are the
 * same DOM, so what you read is what you see.
 */
export function TypeSpecimen({
  utility,
  sample = SAMPLE,
  className,
}: {
  utility: string
  sample?: string
  className?: string
}) {
  const ref = useRef<HTMLParagraphElement>(null)
  const [spec, setSpec] = useState<string | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => setSpec(readSpec(el))
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <p className="text-meta text-muted-foreground">
        {utility}
        {spec ? ` · ${spec}` : ''}
      </p>
      <p ref={ref} className={cn(utility, 'text-foreground')}>
        {sample}
      </p>
    </div>
  )
}
