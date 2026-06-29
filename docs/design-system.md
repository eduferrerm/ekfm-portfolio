# Design System — Tokens & Type

The CSS foundation for the EKFM portfolio: a three-tier colour-token architecture plus a
semantic type scale, all in `app/globals.css`. Single dark theme (no light mode, no `.dark`).
Live viewer: **`/design-system`** (reads the `lib/design-system` catalog and resolves every token +
type role live off `globals.css`).

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
only legitimate direct-primitive use is the `/design-system` page documenting the palette,
brand/structural marks with no semantic role, and a **data-viz categorical scale** where the
3-tier brand can't encode the dimension — the More-About-Me mental graph paints its 13 node
categories with stock Tailwind `*-500` stops (sans lime; `categoryTier.ts`), a deliberate,
documented exception. Emitting `bg-[var(--x)]` for a _role_ means something skipped the bridge —
that is a defect.

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

Roles name **jobs, not values** — resolved stops live in `app/globals.css` and the live
`/design-system` viewer, so this table can't go stale when a stop is retuned.

| Token                                | Role                                              |
| ------------------------------------ | ------------------------------------------------- |
| `--background`                       | page                                              |
| `--foreground`                       | body text (lightest stop)                         |
| `--card` / `--card-foreground`       | elevated surface / text on it                     |
| `--muted` / `--muted-foreground`     | quiet surface / quiet text                        |
| `--sunken`                           | recessed surface (sits below the page)            |
| `--border` / `--input`               | default hairline / form-control border            |
| `--border-tag`                       | tag / chip border                                 |
| `--border-card`                      | card border                                       |
| `--primary` / `--primary-foreground` | primary action / emphasis / text on it            |
| `--accent` / `--accent-foreground`   | tertiary accent / text on it                      |
| `--ring`                             | focus ring (→ `--accent`)                         |
| `--selection`                        | selected state (underline / border / fill)        |
| `--label`                            | section sub-heading / accent label text           |
| `--feedback`                         | active-feedback flash                             |
| `--overlay`                          | dim wash behind modals / menus                    |

**Border width** — every border is 1px via `--default-border-width`; thicker numeric/arbitrary
variants are blocked in `.githooks/pre-commit`, so `border` is the only width on the site.

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
| `text-header`                  | Condensed | 400       | **clamp 28→40px**  | 1.5          | —                     |
| `text-subtitle`                | Roboto    | 400       | 24                 | 1.25         | —                     |
| `text-subheader`               | Condensed | 400       | 18                 | 1.1          | —                     |
| `text-lead`                    | Roboto    | 400       | 18                 | 1.5          | —                     |
| `text-body`                    | Roboto    | 400       | 16                 | 1.5          | —                     |
| `text-list`                    | Roboto    | 400       | 14                 | 1.0          | —                     |
| `text-ui` / `text-ui-bold`     | Roboto    | 400 / 700 | 14                 | 1.0          | —                     |
| `text-card-title`              | Roboto    | 400       | 24                 | 1.0          | —                     |
| `text-card-body`               | Roboto    | 400       | 14                 | 1.43 (20/14) | —                     |
| `text-eyebrow`                 | Roboto    | 500       | 16                 | 1.0          | —                     |
| `text-hero-list`               | Roboto    | 400       | 12                 | 2.0          | —                     |
| `text-aside`                   | Condensed | 500       | 24                 | 1.0          | **uppercase**         |
| `text-nav`                     | Condensed | 400       | 16                 | 1.0          | **uppercase**         |
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
- **Nav** (`text-nav` = main nav AND the inner-page side rail / overlay — `SiteNav` now uses the
  same 16px role for parity) bakes in **uppercase**. `text-aside` is the brand sheet's larger
  "subpage" Menu variant (24px), kept in the scale but currently unused. (These are the brand
  sheet's "Menu" group, renamed by surface — `main`→`nav`, `subpage`→`aside` — for semantic salience.)
- **Eyebrows** (`text-eyebrow`) are **natural case** (sentence/title as authored) — the earlier
  uppercase + letter-spaced 12px treatment was dropped for a quieter 16px medium label.

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
  `font-size` group, so a role + a colour both survive (and two roles still dedupe to one). That
  role list (`textRoleNames`) is derived from the generated catalog, so adding an `@utility text-*`
  and running `pnpm generate:tokens` is enough — there is no hand-kept list to update.
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

- **`Pressable`** (`components/primitives/Pressable.tsx`) — the pressable **mechanism** under every
  button-shaped control, with zero brand policy: the icon ↔ label layout (`startIcon` / `endIcon`),
  the global fuchsia focus ring, the disabled treatment, and `asChild` (Radix Slot). It knows nothing
  about emphasis tiers, the pill skin, or chevron policy — those are `Button`'s. The split is the
  escape hatch: a **one-off** builds straight from `Pressable` with arbitrary styles (a shared
  `buttonVariants({ … })` skin _or_ a bespoke one) instead of registering a `variant` it would be the
  only member of. The **search palette** trigger uses a **bespoke skin** — tag-style border
  (`border-border-tag`), a dark `bg-sunken` recessed fill (`--sunken`, below the `--background` page), a
  leading lime Search glyph, no chevron, `text-nav` label on a child `<span>` — composed via
  `Pressable` with no variant.
- **`Button`** (`components/ui/button.tsx`) — the **design-system layer** over `Pressable`:
  `buttonVariants` is the brand skin (`cva`), with `variant` primary / secondary / ghost (the closed
  set of emphasis _tiers_), `size` sm / md / **icon** (square, wraps a single lucide/Chevron glyph),
  `asChild`, and the **chevron policy** (primary/secondary `md` auto-carry an end chevron; `chevron` /
  `chevronColor` override). Consumed by `SliderControls` (Prev/Next), `ShowcaseGallery` (Visit site),
  `LandingCard` (ghost CTA), `DearCompanySection` + `ContactBand` (secondary CTAs), mobile back/close
  (ghost icon, lime at rest per the board), and the **nav** (the shared `MenuOverlay` hamburger +
  close, ghost icons lime at rest, on both `StickyNavReveal` and `SectionShell`). A Button whose label needs a non-default
  type role puts the role on a child `<span>` to scope it to the label text. (The palette's Clear /
  recent-search controls are plain underlined / muted **text links**, not buttons — the board shows
  no pill there.)
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

Component demos render at **`/design-system`** under _Components · cva_ (`PreviewComponents`).

### Nav (landing + asides)

The nav consumes the renamed Menu roles — no bespoke role. **`text-nav`** (16) drives the main nav:
the in-hero copy (`bands.tsx`, decorative, blue `--selection` pipe separators), the sticky header
(`StickyNavReveal`, desktop + mobile overlay), and the inner-page side rail / overlay tree
(`SiteNav`) — one 16px role across every nav surface. Active **section** = `text-foreground` + a
**lime underline** (`decoration-primary`), per the board; the active **sub-item card** is the blue
`--selection` you-are-here surface (`border-selection` + `bg-selection/20`), shared with the
result-row / nav-card state. Icon controls
(hamburger / close in the shared `MenuOverlay`, used by `StickyNavReveal` + `SectionShell`) are
Button `size="icon"` ghosts, lime (`text-primary`) at rest.

### Self-describing viewer (SSOT) — `globals.css` is the only place you author

`/design-system` is a **viewer** — it owns no design values. `globals.css` is the single source of
truth; everything else is generated from it or reads it live, so a token is **authored once.**

**The pipeline:**

- **`app/globals.css`** — values + `@utility text-*` blocks, plus machine markers: a `@ds-groups`
  header declares the colour foundations (id/title/caption mode) and each `:root` token is tagged
  `/* @ds <group> [dark] */`. (`dark` = the swatch needs a light label.)
- **`scripts/generate-tokens.mts`** (`pnpm generate:tokens`) — scrapes those markers + the
  `@utility text-*` names into **`lib/design-system/tokens.generated.ts`** (`generatedColorGroups`,
  `dsThemeTextStyles`). A build artifact — **never hand-edit it.**
- **`lib/design-system/tokens.ts`** — the small hand part: the `DSThemeColor` types, the curated
  `palette` foundation (stock Tailwind stops aren't in globals.css to scrape), and derives
  `textRoleNames` from the generated list. Exports `dsThemeColors` (generated roles/states + palette).
- **`lib/utils.ts`** — `cn()`'s twMerge config imports `textRoleNames`; **no hand-kept `TYPE_ROLES`.**
- **`lib/design-system/resolveTokens.ts`** — reads live values at runtime: `resolveValue` (computed
  `:root` prop), `resolveProvenance` (the AUTHORED `var(--color-slate-900)` recovered from the
  `:root` `CSSStyleRule` text — `getComputedStyle` only returns the resolved value), `resolveTextStyle`
  (a type role's spec off a rendered element).
- **the viewer** (`app/(frontend)/(dev)/design-system/`) — `page.tsx` composes the `Preview*` cluster
  (`PreviewColor` / `PreviewTextStyle` / `PreviewComponents` / `PreviewSection`; prefix so they
  surface together in the file palette). Whether a type role is "featured" (hero headline) is a viewer
  decision in `page.tsx`, not token data.

**Authoring a token:**

- **Edit a value/property** (weight, hue, size, transform) → edit `globals.css` **only**. No
  regeneration — the name didn't change; the viewer re-reads the value live.
- **Add / rename / remove** → edit `globals.css` (+ its `@ds` tag for a new colour token), then the
  generated catalog follows. It regenerates automatically on **`predev`** (every `pnpm dev` start) and
  via **`pnpm watch:tokens`** (live, second terminal); the **`.githooks/pre-commit`** hook regenerates
  + stages on commit, so a stale `tokens.generated.ts` can't be committed. Rename also needs the
  call-site `bg-`/`text-` strings (grep — opaque to tooling) + this doc's token table.

So **both** colour captions and type specs are read live and can never drift, and the TS name-lists
are generated, not hand-copied — there's no second place to register a token. Component demos stay
AUTHORED (`PreviewComponents`) — there's no token to read, the component itself is the source. (CI, if
added, should run `pnpm generate:tokens && git diff --exit-code lib/design-system/tokens.generated.ts`
to block drift.)

### Still deferred

The `Chevron` primitive composed onto the layer, and the blue sub-heads ("Overview", "Query
Params") — sans vs `text-subheader` (Condensed), pending the inner-page boards.
