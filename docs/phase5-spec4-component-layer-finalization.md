# Phase 5 — SPEC4 Component Layer Finalization

**Date:** 2026-08-06
**Milestone:** shadcn preset-4 adoption (SPEC/SPEC4.md)
**Scope:** frontend only (`school-frontend/src`)

## Goal
Formalize `src/components/UI.jsx` as the kept composition layer: consistent
focus-visible/ring affordances, keyboard accessibility for custom interactive
elements, and screen-reader labels for icon-only controls. Correct documentation
drift that claimed `UI.jsx` was deleted.

## Decisions (confirmed in SPEC4)
- `UI.jsx` is **kept** and formalized as the app's composition layer — it wraps
  shadcn primitives (Badge, Table, Dialog, AlertDialog, Button, Skeleton) and
  exports `SectionHeader`, `StatCard`, `Modal`, `ConfirmModal`, `Field`,
  `Pagination`, `EmptyState`, `StatusBadge`.
- SPEC3-era docs (`docs/phase6-shadcn-cleanup.md`) claiming `UI.jsx` was
  deleted are now corrected.

## Changes
1. **aria-labels on icon-only controls:** all `size="icon"` ghost buttons
   across `pages/*` and `App.jsx` gained `aria-label` mirroring their `title`
   ("View", "Edit", "Delete", "Link parent", "Print", "Reset", "Void", …).
2. **App shell buttons:** mobile "Open menu" / "Close menu" icon buttons got
   `aria-label` (they had no `title`).
3. **Focus-visible ring on custom interactive elements:**
   - `App.jsx` sidebar `NavLink` — `focus-visible:ring-2 ring-ring
     ring-offset-2 ring-offset-background` (the nav links are hand-rolled, not
     shadcn, so they previously had no focus affordance).
   - `Fees.jsx` status-toggle `Badge` — promoted to a real control:
     `role="button"`, `tabIndex={0}`, `Enter`/`Space` key activation, and a
     focus-visible ring. (Previously mouse-only.)
4. **Status badge contrast:** token-based `STATUS_STYLES` already carry
   `text-success`/`text-warning`/`text-partial`/`text-info`/`text-destructive`
   on `bg-*/15`; confirmed each foreground/background pair meets WCAG AA on the
   token surface. No dark-mode class toggling needed — CSS vars adjust
   lightness.

## Verification
- Grep: no `size="icon"` button with `title=` lacks an `aria-label`.
- `npm run build`: passes.
- `npm test`: 7/7 pass.

## Files Touched
`src/App.jsx`, `src/pages/Students.jsx`, `src/pages/Teachers.jsx`,
`src/pages/Invoices.jsx`, `src/pages/Parents.jsx`, `src/pages/Payments.jsx`,
`src/pages/Users.jsx`, `src/pages/Fees.jsx` (aria-labels + focus rings).
