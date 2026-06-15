/**
 * Single shared slug helper. Used for Experience anchor ids (`/experience#slug`)
 * and, later, Landing section anchors (`/#slug`) — one implementation so the
 * stored/derived slug always matches the id stamped at render time.
 *
 * Deterministic and dependency-free: lowercase, strip diacritics, collapse any
 * run of non-alphanumeric characters to a single dash, trim leading/trailing
 * dashes.
 */
export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip combining diacritical marks
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
