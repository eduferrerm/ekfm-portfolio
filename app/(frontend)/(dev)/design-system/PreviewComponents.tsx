import { Search, X } from 'lucide-react'

import { Chevron } from '@/components/primitives/Chevron'
import { Tag } from '@/components/primitives/Tag'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

/**
 * The cva component layer, demonstrated. Unlike the colour/type previews these
 * are AUTHORED examples, not derived from a catalog — there's no token to read,
 * the component itself is the source, you just render it with representative
 * props. Hover / focus / active are CSS-only, so this stays a server component.
 */
export function PreviewComponents() {
  return (
    <>
      <p className="text-meta text-muted-foreground">
        Hover / focus / active states are interactive — tab to a control or hover it to see the
        channels (focus = fuchsia ring, hover = lime affordance, press = lime feedback).
      </p>

      <div className="flex flex-col gap-3">
        <p className="text-meta-bold text-foreground">Button · primary / secondary / ghost</p>
        <div className="flex flex-wrap items-center gap-4">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button disabled>Disabled</Button>
          <Button size="sm" variant="secondary">
            Small
          </Button>
          <Button size="icon" variant="ghost" aria-label="Close (icon size)">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-meta-bold text-foreground">
          Button · chevron (start / end; colour the glyph independently of the label)
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Button chevron="start">Back</Button>
          <Button chevron="end">Next</Button>
          <Button
            variant="ghost"
            size="sm"
            chevron="end"
            chevronColor="text-primary"
            className="border-foreground text-foreground"
          >
            Explore (card CTA)
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-meta-bold text-foreground">
          Input · fuchsia focus ring (tab in to see the focus channel)
        </p>
        <div className="relative max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search" aria-label="Specimen search" className="pl-9 pr-3" />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-meta-bold text-foreground">Tag · default / selected (lime fill)</p>
        <div className="flex flex-wrap items-center gap-2">
          <Tag>Default</Tag>
          <Tag selected>Selected</Tag>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-meta-bold text-foreground">
          Card · static / interactive (hover+focus) / selected (blue)
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <p className="text-card-title text-foreground">Static</p>
            <p className="mt-2 text-card-body text-muted-foreground">Plain surface.</p>
          </Card>
          <Card asChild interactive>
            <a href="#" className="block">
              <p className="text-card-title text-foreground">Interactive</p>
              <p className="mt-2 text-card-body text-muted-foreground">Hover / focus me.</p>
            </a>
          </Card>
          <Card selected>
            <p className="text-card-title text-foreground">Selected</p>
            <p className="mt-2 text-card-body text-muted-foreground">You-are-here (blue).</p>
          </Card>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-meta-bold text-foreground">
          Chevron · directional glyph (recolours by prop; composes into a Button)
        </p>
        <div className="flex flex-wrap items-center gap-5">
          <Chevron direction="up" color="text-muted-foreground" />
          <Chevron direction="right" color="text-muted-foreground" />
          <Chevron direction="down" color="text-muted-foreground" />
          <Chevron direction="left" color="text-muted-foreground" />
          <Button variant="ghost" size="icon" aria-label="Chevron in a button">
            <Chevron direction="down" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-meta-bold text-foreground">
          Nav active state · text-nav, lime underline (you-are-here)
        </p>
        <ul className="flex items-center gap-x-5">
          <li>
            <span className="text-nav text-muted-foreground">TLDR</span>
          </li>
          <li>
            <span className="text-nav text-foreground underline decoration-primary underline-offset-4">
              Portfolio
            </span>
          </li>
          <li>
            <span className="text-nav text-muted-foreground">Contact</span>
          </li>
        </ul>
      </div>
    </>
  )
}
