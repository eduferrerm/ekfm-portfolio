# design-refs/

Local-only stash of design **reference boards** (exports from `EKFM-Brand-2026` —
Colors / Fonts / Pressables / per-page mockups). Drop image/PDF exports here so
Claude Code (and you) can reference the authoritative designs across sessions
without re-uploading them into a session scratchpad each time.

- **Git-ignored** (everything except this README): these are large brand assets,
  and the brand sheets — not the repo — are the SSOT (see `docs/design-system.md`).
- **Stable path:** `design-refs/<name>.<ext>` at the repo root, so it survives
  session resets (unlike the `/private/tmp/.../scratchpad` dir, which is wiped).

## Naming
Lowercase-kebab, descriptive of the surface, e.g.:

```
fonts-1440.jpg
colors.jpg
pressables.jpg
landing.jpg
search-palette.jpg
search-palette-visitor-empty-state.jpg
portfolio-details-page.jpg
experience-details-page.jpg
```

If a board is page-specific, name it after the page; if it's a token sheet, name
it after the sheet (`fonts-…`, `colors-…`, `pressables-…`).
