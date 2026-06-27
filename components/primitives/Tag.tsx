import { cn } from '@/lib/utils'

/**
 * Pill primitive. Renders a single keyword/label as a rounded chip. Used by the
 * `tag` variant of {@link List} (scope/craft on the experience page) and reused
 * wherever a discrete label needs chip styling.
 */
export function Tag({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-sm text-muted-foreground',
        className,
      )}
    >
      {children}
    </span>
  )
}
