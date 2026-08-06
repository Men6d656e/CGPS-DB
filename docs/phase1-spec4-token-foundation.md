# Phase 1 — SPEC4 Token Foundation & Theme Decoupling

**Date:** 2026-08-06
**Milestone:** shadcn preset-4 adoption (SPEC/SPEC4.md)
**Scope:** frontend only (`school-frontend/src`)

## Goal
Make the theme 100% token-driven: replace the legacy dual color system (custom
`--app-*` variables + an `html:not(.dark)` remap layer) with the shadcn preset's
CSS-var tokens, and add the semantic brand/status token set required by later
phases.

## Changes
### `src/index.css`
- **Removed:** legacy `--app-bg` / `--app-surface` / `--app-text-*` variables and
  the entire `html:not(.dark) { … }` remap layer (the last vestige of the dual
  color-system root cause identified in `project-overview4.md`).
- **Added** (light + dark): `--accent-brand` (sky-600), `--accent-brand-strong`
  (sky-700), `--accent-brand-foreground`, `--success`, `--warning`, `--partial`,
  `--info`.
- **Wired `body`** to `--background` / `--foreground` with `@apply font-body
  antialiased` and two subtle radial gradients using `hsl(var(--accent-brand)
  / 0.07)` for depth.

### `tailwind.config.js`
- Added color slots `accent-brand` (DEFAULT/foreground/strong), `success`,
  `warning`, `partial`, `info` — all via `hsl(var(…))`.
- Added the Type Scale `fontSize` extension (xs → 2xl with line-heights).
- Removed the raw `slate-{}` / `brand-*` / `gold-*` scales that let raw classes
  compile.

### `package.json`
- Removed `next-themes` (unused; the custom `ThemeContext` handles theming).
- Added `clsx ^2.1.1` as a direct dependency (used by `lib/utils.js`, previously
  transitively resolved).
- `npm install` updated the lockfile.

## Verification
- `npm run build` passes.
- The dual color-system remap layer is gone; pages rely purely on preset tokens.

## Files Touched
`src/index.css`, `tailwind.config.js`, `package.json`, `package-lock.json`.
