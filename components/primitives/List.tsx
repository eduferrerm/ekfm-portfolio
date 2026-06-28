import { cn } from '@/lib/utils'

import { Chevron } from './Chevron'
import { Tag } from './Tag'

/**
 * List primitive over an array of strings.
 *
 * - `prose` — vertical list of paragraphs, each preceded by a chevron marker
 *   (the "Role Description" layout: responsibilities rendered as full sentences,
 *   not terse bullets).
 * - `tag` — horizontal wrap of {@link Tag} pills (scope/craft keywords).
 *
 * Renders nothing when `items` is empty, so callers can drop the surrounding
 * section by checking length themselves or letting this no-op.
 */
type ListProps = {
  variant: 'prose' | 'tag' | 'text'
  // `text` is a simple vertical list of plain strings, no chevrons or tags
  // `prose` accepts rich nodes (e.g. a paragraph with a highlighted span); `tag`
  // callers still pass plain strings.
  items: React.ReactNode[]
  itemsClassName?: string
  chevronColor?: string
  className?: string
}

export function List({ variant, items, className, itemsClassName, chevronColor }: ListProps) {
  if (items.length === 0) return null

  switch (variant) {
    case 'prose':
      return (
        <ul className={cn('space-y-6', className)}>
          {items.map((item, i) => (
            <li key={i} className={cn('flex gap-3', itemsClassName)}>
              <span aria-hidden className="mt-1.5 shrink-0">
                <Chevron
                  direction="right"
                  color={chevronColor ?? 'text-muted-foreground'}
                  className="h-3.5 w-auto"
                />
              </span>
              <p className="leading-relaxed text-foreground/90">{item}</p>
            </li>
          ))}
        </ul>
      )
    case 'tag':
      return (
        <ul className={cn('flex flex-wrap gap-2', className)}>
          {items.map((item, i) => (
            <li key={i} className={cn('shrink-0', itemsClassName)}>
              <Tag>{item}</Tag>
            </li>
          ))}
        </ul>
      )
    case 'text':
      return (
        <ul className={cn('space-y-2 flex flex-wrap', className)}>
          {items.map((item, i) => (
            <li key={i} className={cn('text-foreground/90', itemsClassName)}>
              {item}
            </li>
          ))}
        </ul>
      )
  }
}
