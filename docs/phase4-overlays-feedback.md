# Phase 4 (SPEC3) — Overlays & Feedback Migration 🗔

> **Date:** 2026-08-06 | **Branch:** `my-changes`
> **Commit:** `feat(phase4-spec3): shadcn overlays and feedback`

## What was done

### Modal → shadcn `Dialog`
- `UI.jsx` `Modal` is now a thin wrapper around the shadcn `Dialog` (Radix).
  Page call-sites are unchanged (`open` / `onClose` / `title` / `maxWidth`).
- Radix provides focus trap, ESC to close, overlay click-to-close, body scroll
  lock, and the built-in close button — replacing the hand-rolled version.

### ConfirmModal → shadcn `AlertDialog`
- `ConfirmModal` now renders `AlertDialog` with `AlertDialogCancel` /
  `AlertDialogAction`; destructive confirms get the `bg-destructive` treatment.
- Same props as before (`open` / `onClose` / `onConfirm` / `title` / `message` /
  `confirmText` / `isDestructive`).

### react-hot-toast → sonner
- `main.jsx` now renders the shadcn `sonner` `Toaster` (`position="top-right"`,
  `richColors`) inside `ThemeProvider` — the wrapper reads the app's own
  ThemeContext (it was rewired to it in Phase 1, no `next-themes` dependency).
- All 8 pages: `import toast from 'react-hot-toast'` → `import { toast } from 'sonner'`.
  The `toast.success(...)` / `toast.error(...)` calls are API-compatible.
- `react-hot-toast` **removed** from `package.json`.

### ErrorBoundary polish
- Dev-mode error details now render in a shadcn `Alert variant="destructive"`
  (monospace stack trace) instead of a custom `<pre>` box.

## Verification

| Check | Result |
|---|---|
| `grep react-hot-toast src` | ✅ 0 matches |
| `npm uninstall react-hot-toast` | ✅ removed from package.json |
| `npx vite build` | ✅ built |
| `npx vitest run` | ✅ 4 passed (2 files) |
| `npx eslint src` | ✅ 0 errors (5 pre-existing warnings) |

## Files

- **Modified:** `src/components/UI.jsx` (Modal/ConfirmModal),
  `src/main.jsx` (sonner Toaster), `src/components/ErrorBoundary.jsx`
- **Updated:** all 8 pages (sonner import), `package.json`, `package-lock.json`

## Notes for later phases

- `App.jsx` shell (sidebar/header/nav) is the last custom-UI area — Phase 5
  rebuilds it with shadcn components + token typography/colors/radius, then
  Phase 6 deletes the remaining custom CSS and dead files.
