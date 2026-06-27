# Design System — Tokens & Type

The CSS foundation for the EKFM portfolio: a three-tier colour-token architecture plus a
semantic type scale, all in `app/globals.css`. Single dark theme (no light mode, no `.dark`).
Live specimen: **`/design-system`** (renders every token + type role).

> Source of truth split: **data** (palette stops, font sizes, line-heights) comes from the brand
> sheets in `EKFM-Brand-2026` (Colors / Fonts / Pressables). **Decisions** (the tier model, which
> tokens exist, naming) are documented here.

---

## The three tiers

```
@theme            → PRIMITIVES   (raw values; generate utilities)
:root             → SEMANTIC     (roles; reference primitives)
@theme inline     → BRIDGE       (re-expose roles as utilities)
@utility …        → TYPE SCALE   (semantic type roles, element-agnostic)
```

**The one rule:** components consume **semantic utilities only** — `bg-primary`, `text-foreground`,
`text-card-title`. Never primitives (`bg-slate-900`), never raw vars (`bg-[var(--primary)]`). The
only legitimate direct-primitive use is the `/design-system` page documenting the palette, and
brand/structural marks with no semantic role. Emitting `bg-[var(--x)]` means something skipped the
bridge — that is a defect.

### Tier 1 — primitives (`@theme`)

The palette is **stock Tailwind 4** (`slate`, `lime`, `fuchsia`, `blue`) — those stops already
ship, so they are **not** redeclared. `@theme` holds only what TW lacks:

- **Fonts** — `--font-sans` (Roboto), `--font-condensed` (Roboto Condensed), fed by `next/font`
  in `app/(frontend)/layout.tsx` (`--font-roboto` / `--font-roboto-condensed`).
- **Alpha tints** — `--color-lime-200-20`, `--color-blue-400-20`, `--color-slate-900-50`, derived
  off stock stops via `color-mix(in oklch, …)` (interpolation space only; the base stays a stock
  TW colour, never rewritten as an `oklch()` literal).
- **Gradient** — `--gradient-surface: linear-gradient(180deg, #1b2434 15%, #101625 100%)`, exposed
  cleanly via `@utility bg-gradient-surface` (no raw var at call sites).

### Tier 2 — semantic roles (`:root`)

Roles keep shadcn's variable names (so net-new shadcn components drop in) but point at the stock
palette, making the palette the SSOT.

| Token                                | →                       | Notes                                      |
| ------------------------------------ | ----------------------- | ------------------------------------------ |
| `--background`                       | slate-900               | page                                       |
| `--foreground`                       | slate-300               | body text (lightest stop)                  |
| `--card` / `--card-foreground`       | slate-800 / slate-300   | elevated surface                           |
| `--muted` / `--muted-foreground`     | slate-700 / slate-400   | recessed surface / quiet text              |
| `--border` / `--input`               | slate-700               |                                            |
| `--primary` / `--primary-foreground` | lime-200 / slate-900    | primary action / emphasis                  |
| `--accent` / `--accent-foreground`   | fuchsia-300 / slate-900 | tertiary accent                            |
| `--ring`                             | `var(--accent)`         | focus ring                                 |
| `--selection`                        | blue-400                | selected state (underline / border / fill) |
| `--label`                            | blue-400                | section sub-heading / accent label text    |
| `--feedback`                         | lime-200                | active-feedback flash                      |
| `--scrim`                            | slate-900/50            | overlay / dim                              |

### Tier 3 — bridge (`@theme inline`)

Every `:root` role gets a `--color-*` entry so `bg-*` / `text-*` / `border-*` / `ring-*` utilities
exist and autocomplete. `inline` resolves straight through to the primitive (no extra var hop).
Nothing in `:root` is reachable only as a raw `var()`.

---

## Brand colour story: primary / secondary / tertiary

Three tiers, each a single stock stop. **Tokens are named by JOB, not by rank** — several jobs can
share a tier's hue:

| Tier                                       | Hue           | Tokens (job-named)        |
| ------------------------------------------ | ------------- | ------------------------- |
| **Primary** (loudest / emphasis)           | `lime-200`    | `--primary`, `--feedback` |
| **Secondary** (quieter accent / hierarchy) | `blue-400`    | `--selection`, `--label`  |
| **Tertiary** (focus)                       | `fuchsia-300` | `--accent`, `--ring`      |

**Why job-naming, not rank-naming:** "importance rank" is subjective ("is this lime or blue?"
has no objective answer), and `secondary` already means a neutral grey _surface_ in shadcn. So the
tier is the **organising story**; the **tokens** devs type are named for what they do. Same way
lime is both `--primary` (action) and `--feedback` (flash). Blue's two jobs are distinct axes — an
_interaction state_ (`--selection`) vs a _content-hierarchy label_ (`--label`) — so they get
distinct names even though they share `blue-400`.

**Deliberately dropped** (zero usage; re-add reactively if a stock component needs one):
`secondary`, `popover`, `destructive`, `chart-*`, `sidebar-*`. (`--accent` was kept against the
original handoff brief's "no accent" — it is the named tertiary tier.)

---

## Type scale (`@utility`)

Semantic type roles, **element-agnostic**: the role owns the typographic identity (family, weight,
size, line-height, transform); the author picks the HTML tag at the call site
(`<h3 class="text-card-title">`). Visual role and document outline stay decoupled — **no `Text`
component, no variant→tag map.** Layout/spacing (`mb-6`, `max-w-2xl`) stays as inline utilities;
never fold it into a type role.

| Utility                        | Family    | Weight    | Size               | Line-height  | Transform             |
| ------------------------------ | --------- | --------- | ------------------ | ------------ | --------------------- |
| `text-hero-headline`           | Condensed | 500       | **clamp 40→103px** | 1.0          | — (natural case)      |
| `text-header`                  | Condensed | 500       | **clamp 28→40px**  | 1.5          | —                     |
| `text-subtitle`                | Roboto    | 400       | 24                 | 1.25         | —                     |
| `text-subheader`               | Condensed | 500       | 18                 | 1.1          | —                     |
| `text-lead`                    | Roboto    | 400       | 18                 | 1.5          | —                     |
| `text-body`                    | Roboto    | 400       | 16                 | 1.5          | —                     |
| `text-list`                    | Roboto    | 400       | 14                 | 1.0          | —                     |
| `text-ui` / `text-ui-bold`     | Roboto    | 400 / 700 | 14                 | 1.0          | —                     |
| `text-card-title`              | Roboto    | 400       | 24                 | 1.0          | —                     |
| `text-card-body`               | Roboto    | 400       | 14                 | 1.43 (20/14) | —                     |
| `text-eyebrow`                 | Roboto    | 700       | 12                 | 1.0          | **uppercase** + 0.1em |
| `text-hero-list`               | Roboto    | 400       | 12                 | 2.0          | —                     |
| `text-aside`                   | Condensed | 500       | 24                 | 1.0          | **uppercase**         |
| `text-nav`                     | Condensed | 500       | 16                 | 1.0          | **uppercase**         |
| `text-meta` / `text-meta-bold` | Roboto    | 400 / 700 | 12                 | 1.0          | —                     |

**Naming collision resolved:** the brand sheet's "primary" type role would clash with the
auto-generated `text-primary` _colour_ utility (TW4 `text-*` comes from both the `--color-*` and
`--text-*` namespaces), so it is `text-ui` / `text-ui-bold`.

### Line-heights

Mapped to TW's named `leading-*` vars where they land cleanly (125%→`tight`, 150%→`normal`,
200%→`loose`); `100%` is literal `1` (TW has no `--leading-none`); `text-card-body` is `1.4286`.

### Responsive (fluid `clamp()`)

Only the large display roles scale; small text stays fixed (fluid 14px just jitters). `clamp(MIN,
PREFERRED, MAX)` scales **continuously** with viewport — no breakpoint steps. PREFERRED is written
`rem + vw` (not pure `vw`) so browser zoom still works.

- `text-hero-headline`: `clamp(2.5rem, 0.87rem + 6.96vw, 6.4375rem)` — 40→103px
- `text-header`: `clamp(1.75rem, 1.44rem + 1.33vw, 2.5rem)` — 28→40px

### Casing (from the designs, not the sheet labels)

The brand sheet labelled several roles "Capitalized", but the designs show otherwise, and
`capitalize` would corrupt acronyms ("Website UX Personalisation" → "Ux"):

- **Page titles** (`text-hero-headline`) keep **natural case** — no transform. The landing hero
  applies `uppercase` at the call site.
- **Nav** (`text-nav` = main nav: hero + sticky header; `text-aside` = inner-page side rail) and
  **eyebrows** (`text-eyebrow`) bake in **uppercase**. (These are the brand sheet's "Menu" group,
  renamed by surface — `main`→`nav`, `subpage`→`aside` — for semantic salience.)

---

## Conventions / how to use

- **Colour:** reach for a semantic role (`bg-card`, `text-muted-foreground`, `ring-ring`,
  `text-label`). Opacity modifiers are fine (`bg-selection/20`). Never a raw stop in a component.
- **Type:** one role class per element (`<h2 class="text-header">`), not a hand-assembled
  `text-3xl font-semibold tracking-tight` stack. If a heading style must change, it changes in one
  `@utility`.
- **`cn` knows the type roles:** every `text-*` role shares the `text-` prefix with colour
  utilities, so stock tailwind-merge would file `cn('text-nav', 'text-muted-foreground')` as a
  colour clash and silently drop the _role_. `lib/utils.ts` registers all roles in twMerge's
  `font-size` group, so a role + a colour both survive (and two roles still dedupe to one). **Keep
  that `TYPE_ROLES` list in sync when adding or renaming an `@utility text-*`.**
- **Component variants vs colour roles:** a `<Button variant="primary">` _uses_ `--primary`; the
  variant name is the component's emphasis tier, the colour token is global. Never invent
  per-component colour tokens like `--card-primary`.
- **Section sub-heads:** a content section sub-heading (Overview, System Design, Query Params,
  Responsibilities, Scope, Craft…) is always `text-subheader text-label` — blue (`--label`), never
  grey or a `text-eyebrow`. (The experience detail page was the lone grey outlier; now aligned.)
- **Chevron markers:** the `Chevron` glyph used as a list/prose bullet is `text-muted-foreground`
  (grey-400), not lime — lime is reserved for affordances/CTAs. (The over-photo TL;DR band keeps its
  light `text-white/60` marker; that surface is intentionally off the shared tokens.)

---

## Component layer (cva)

On top of the token + type foundation sits a `cva` (class-variance-authority) + `tailwind-merge`
component layer. Components consume **semantic utilities only** — variant names are the component's
emphasis tier; the colour token stays global (`<Button variant="primary">` _uses_ `--primary`).
shadcn-shaped primitives live in `components/ui/`; brand primitives stay in `components/primitives/`.
Render a control as a link with **`asChild`** (Radix Slot) — the variant classes compose onto the
child `<Link>`/`<a>`.

### State → channel model (decoded from the Pressables board)

Three channels are **global**, one is **per-component**:

| State                                                   | Channel                                                       | Token                                                                                                   |
| ------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| **Focused**                                             | fuchsia ring                                                  | `ring-ring` (→ `--accent`) — every pressable                                                            |
| **Hover**                                               | lime affordance (fills outline things, inverts the solid one) | `--primary`                                                                                             |
| **Active: feedback** (momentary press)                  | lime flash / dim                                              | `--feedback`                                                                                            |
| **Disabled**                                            | dimmed                                                        | opacity                                                                                                 |
| **Active: selection** (persisted "on" / "you are here") | **per-component**                                             | tag → **lime fill** (`--primary`); result-row/nav card → **blue** (`--selection`); nav item → underline |

The selection split is deliberate: **lime = affordance + toggled-on** (a selected filter chip),
**blue = the current navigation location** (the selected result-row card). The brand brief's
"tag selected = blue" was overridden by the rendered board (selected chip fills lime).

### Built components

- **`Button`** (`components/ui/button.tsx`) — `variant` primary / secondary / ghost, `size` sm / md /
  **icon** (square, wraps a single lucide/Chevron glyph), `asChild`. Consumed by `SliderControls`
  (Prev/Next), `ShowcaseGallery` (Visit site), `LandingCard` (ghost CTA), `DearCompanySection` +
  `ContactBand` (secondary CTAs), the **search palette** trigger (secondary, eyebrow label) +
  mobile back/close (ghost icon, lime at rest per the board), and the **nav** (`MobileMenu` MENU
  trigger; hamburger / close on `StickyNavReveal` + `MobileMenu` as ghost icons). A Button whose
  label needs a non-default type role puts the role on a child `<span>` (e.g. the trigger's
  `text-eyebrow`) to scope it to the label text. (The palette's Clear / recent-search controls are
  plain underlined / muted **text links**, not buttons — the board shows no pill there.)
- **`Input`** (`components/ui/input.tsx`) — `cva` text input; focus is the global fuchsia ring
  (`ring-ring`), not a lime border. Owns the surface + `text-body` role + the four channels; layout
  (an icon's `pl-9`) stays at the call site. Consumed by the search palette query field.
- **`Tag`** (`components/primitives/Tag.tsx`) — `cva`; `selected` fills lime. `tagVariants` is the
  styling for the search palette's **facet chips** (the interactive `<button>` consumer it was
  exported for). The board's chips are _outline_ when unselected, so the palette overrides Tag's
  default grey fill to `bg-transparent` (Tag's own default — a grey-filled chip — is unchanged for
  its other consumers; making it outline globally is an open question pending the experience board).
- **`Card`** (`components/ui/card.tsx`) — `interactive` (hover edge + focus ring) and `selected`
  (blue) axes; `asChild`. Consumed by `LandingCard` and the **search palette**, which nests its
  content in `Card`s: one _Results_ card for corpus search, one card per _Expectation_ in the
  visitor (`/dear/[company]`) empty state, over a `bg-background` panel so the cards read as
  elevated. `SearchResultRow` shares the same `--selection` token for its blue you-are-here state
  (its compact geometry differs from the Card shell, so it reuses the token, not the component).

Specimens render live at **`/design-system`** under _Components · cva_.

### Nav (landing + asides)

The nav consumes the renamed Menu roles — no bespoke role. **`text-nav`** (16) drives the main nav:
the in-hero copy (`bands.tsx`, decorative, blue `--selection` pipe separators) and the sticky header
(`StickyNavReveal`, desktop + mobile overlay). **`text-aside`** (24) drives the inner-page side rail
(`SiteNav`). Active item = `text-foreground` + a **lime underline** (`decoration-primary`), per the
board — _not_ blue (blue stays the result-row / nav-card you-are-here surface). Icon controls
(hamburger / close on `StickyNavReveal` + `MobileMenu`) are Button `size="icon"` ghosts.

### Self-describing specimens

The `/design-system` type-scale captions are **read live off the rendered DOM** via
`getComputedStyle` (`design-system/TypeSpecimen.tsx`, a client component — the page is a server
component), not hand-maintained literals, so a caption can never drift from the `@utility text-*`
definitions in `globals.css`. It reports family (Condensed vs Roboto), weight, current px size,
line-height as a percentage of size, and any `text-transform`; fluid `clamp()` roles report their
current rendered px and re-read on resize. (This caught the old hero caption, which claimed
`capitalize` for a role that has no transform.) Colour/state/palette swatches stay literal — their
captions name the palette stop (`slate-900`), which `getComputedStyle` can't recover from a resolved
`oklch()` value.

### Still deferred

The `Chevron` primitive composed onto the layer, and the blue sub-heads ("Overview", "Query
Params") — sans vs `text-subheader` (Condensed), pending the inner-page boards.
