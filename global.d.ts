// Ambient module declarations for non-TS imports.
//
// Side-effect CSS imports (e.g. `import '@xyflow/react/dist/style.css'` in
// features/portfolio/graph/Graph.tsx) have no type under
// `moduleResolution: "bundler"`, so editors flag TS2307. The app is
// Tailwind-only (no CSS modules), so a blanket `*.css` module is safe and
// won't shadow any `*.module.css` typing.
declare module '*.css'
