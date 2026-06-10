/**
 * Pre-hydration placeholder shown while the client-only graph bundle loads.
 * Keeps layout stable (no CLS) before @xyflow/react mounts.
 */
export function GraphSkeleton() {
  return (
    <div
      className="h-full w-full animate-pulse rounded-lg border border-border bg-muted/40"
      aria-hidden="true"
    />
  )
}
