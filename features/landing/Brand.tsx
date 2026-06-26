import { cn } from '@/lib/utils'

/**
 * The EKFM wordmark — one of the few literal (non-CMS) bits of site chrome.
 * Rendered twice on the landing: large in the centered hero, and small in the
 * sticky nav (where it reveals on scroll). Pass `className` to size/space it.
 */
export function Brand({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-block rounded border border-primary px-2 py-0.5 font-bold tracking-widest text-primary',
        className,
      )}
    >
      EKFM
    </span>
  )
}
