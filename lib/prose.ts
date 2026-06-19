/**
 * Flatten an array of `{ text }` rows (Payload's array-of-textarea shape) to
 * non-empty trimmed-away strings, dropping blanks. Shared by every band/slider
 * that authors prose as repeatable rows (landing prose, key-decision points,
 * deep-dive details).
 */
export function proseLines(rows?: { text?: string | null }[] | null): string[] {
  return (rows ?? []).map((r) => r.text).filter((t): t is string => Boolean(t))
}
