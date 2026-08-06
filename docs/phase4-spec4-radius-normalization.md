# Phase 4 — SPEC4 Radius Normalization

**Date:** 2026-08-06
**Milestone:** shadcn preset-4 adoption (SPEC/SPEC4.md)
**Scope:** frontend only (`school-frontend/src`)

## Goal
Unify all border-radius utilities across pages and components onto the preset's
radius contract: `--radius: 0.5rem` with `rounded-md` as the standard container/
tile radius, `rounded-full` reserved for pills/badges/avatars, and the shadcn
`Card` keeping its default `rounded-xl`.

## Design Contract Applied
From SPEC4's radius rule table:

| Element | Radius |
| --- | --- |
| Outer panels / detail sheets / cards | `rounded-lg` |
| Icon tiles, stat tiles, list rows | `rounded-md` |
| Pills, badges, chips, avatars | `rounded-full` |
| shadcn `Card` (preset default) | `rounded-xl` |

**Documented deviation:** blanket consolidation uses `rounded-md` for both
container and icon-tile tiers (the paper spec distinguished `lg` outer vs `md`
nested). This keeps a tighter, more consistent surface at `0.5rem` and matches
the built `--radius` token. The two genuinely large surfaces that read as
"cards" (the `UI.jsx` Table container and the Dashboard tooltip popover) were
explicitly promoted to `rounded-lg`.

## Changes
1. **Bulk normalization:** `rounded-xl` / `rounded-2xl` → `rounded-md` across
   `App.jsx`, `components/UI.jsx`, `components/ErrorBoundary.jsx`, and pages
   `Dashboard`, `Students`, `Payments`, `Parents`, `Login`, `Users`, `Teachers`,
   `Invoices`, `Fees` (icon tiles, stat tiles, sidebar tiles, list rows, dialog
   bodies, login tiles).
2. **Card preserved:** `components/ui/card.jsx` reverted to its shadcn default
   `rounded-xl` — the preset owns that value, the token `--radius` governs
   everything else.
3. **Outer surfaces promoted:** `UI.jsx` `Table` container and `Dashboard`
   tooltip `rounded-md` → `rounded-lg`.
4. **Pills/chips/avatars → `rounded-full`:**
   - `App.jsx` user avatar `rounded-lg` → `rounded-full`
   - `Students.jsx` "Class N" chip and `Payments.jsx` "INV-…" chip
     `rounded-lg` → `rounded-full`
   - `App.jsx` sidebar logo tile `rounded-lg` → `rounded-md` (it is an icon
     tile, not an avatar).

## Verification
- Grep audit: **zero** `rounded-xl` / `rounded-2xl` in `src/` outside
  `components/ui/card.jsx` (the intentional shadcn default).
- `rounded-full` retained only on genuine pills/badges/avatars/status dots
  (buttons, `StatusBadge`, `SelectTrigger`, sidebar status dot, decorative
  Login blobs).
- `npm run build`: passes.
- `npm test`: 7/7 pass (unchanged).

## Files Touched
`src/App.jsx`, `src/components/UI.jsx`, `src/components/ErrorBoundary.jsx`,
`src/pages/Dashboard.jsx`, `src/pages/Students.jsx`, `src/pages/Payments.jsx`,
`src/pages/Parents.jsx`, `src/pages/Login.jsx`, `src/pages/Users.jsx`,
`src/pages/Teachers.jsx`, `src/pages/Invoices.jsx`, `src/pages/Fees.jsx`
(all radius utilities; `components/ui/card.jsx` untouched in the final state).
