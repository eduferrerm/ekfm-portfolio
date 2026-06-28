import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

/**
 * A titled foundation block in the viewer — the blue sub-head plus its content.
 * Defaults to `gap-8`; pass `className` (e.g. `gap-5`) to override via twMerge.
 */
export function PreviewSection({
  title,
  children,
  className,
}: {
  title: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('flex flex-col gap-8', className)}>
      <h2 className="text-subheader text-primary">{title}</h2>
      {children}
    </section>
  )
}
