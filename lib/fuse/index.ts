import Fuse, { type IFuseOptions } from 'fuse.js'

/**
 * Thin, typed factory around Fuse.js for building fuzzy-search indexes
 * (used by the search palette over portfolio items, experience and keywords).
 */
export function createFuse<T>(items: readonly T[], options: IFuseOptions<T>): Fuse<T> {
  return new Fuse(items, options)
}

export type { IFuseOptions }
