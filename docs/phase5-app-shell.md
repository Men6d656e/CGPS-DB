# Phase 5 (SPEC3) — App Shell & Theme Polish 🎨

> **Date:** 2026-08-06 | **Branch:** `my-changes`
> **Commit:** `feat(phase5-spec3): shadcn app shell and theme polish`

## What was done

### App shell (`App.jsx`)
Rebuilt the sidebar, header, and nav with shadcn components and preset tokens:

- **Sidebar** — `bg-card border-r border-border` (was `bg-slate-900/95 border-slate-800/60`);
  logo typography → `text-foreground` / `text-muted-foreground`; close button →
  `<Button variant="ghost" size="icon">`.
- **Nav** — shadcn active-state pattern: active item = `bg-accent text-accent-foreground`,
  inactive = `text-muted-foreground hover:bg-accent hover:text-accent-foreground`
  (was brand-blue highlight).
- **User block** — `Separator`, token avatar chip (`bg-muted`), role badge via
  `bg-accent` / `bg-muted`, and Sign Out as `<Button variant="ghost">` with a
  destructive hover.
- **Header** — `border-b border-border bg-background/80 backdrop-blur-sm`;
  hamburger/menu → ghost icon `Button`; page title → `text-foreground`.
- **Loading screen** — `bg-background` (was `bg-slate-950`).
- Fixed the invalid `font-600` class → `font-semibold`.

### ThemeToggle (`src/components/ThemeToggle.jsx`)
Now a shadcn `<Button variant="ghost" size="icon">` with `Sun`/`Moon` swap
(was a raw button with slate classes).

### Colors & radius (preset compliance)
- No stray hardcoded hex/rgb in app UI — the only remaining hex values live in
  the invoice **print template** (a standalone printable document with its own CSS).
- Chart colors already use `--chart-1` / `--chart-3` tokens (Phase 3).
- Radius everywhere follows `--radius` via shadcn components.

## Verification

| Check | Result |
|---|---|
| `npx vite build` | ✅ built |
| `npx vitest run` | ✅ 4 passed (2 files) |
| `npx eslint src` | ✅ 0 errors (5 pre-existing warnings) |

## Files

- **Modified:** `src/App.jsx`, `src/components/ThemeToggle.jsx`

## Notes for later phases

- Phase 6 (cleanup) does the final sweep: remove dead code, final CSS cleanup,
  update tests, and the end-to-end verification greps.
