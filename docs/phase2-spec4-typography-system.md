# Phase 2 — SPEC4 Typography System (100% typeset)

**Date:** 2026-08-06
**Milestone:** shadcn preset-4 adoption (SPEC/SPEC4.md)
**Scope:** frontend only (`school-frontend/src`)

## Goal
Enforce the preset typography contract project-wide: display headings set in
`font-display` (Playfair Display), body/UI text in `font-body` (DM Sans),
monospace in `font-mono` (JetBrains Mono) — with zero arbitrary `text-[…]`
sizes.

## Changes
- **`App.jsx`:** role pill `text-[10px]` → `text-xs` (only arbitrary size left,
  now removed).
- **`components/UI.jsx`:** added `font-display` to
  - `SectionHeader` `<h2>`
  - `ConfirmModal` `AlertDialogTitle`
  - `Table` `TableHead` (column headers)
- **`pages/Invoices.jsx`:** print template rewritten from raw Arial + `#333`
  hex to the design families — Playfair Display (invoice title), DM Sans (body),
  JetBrains Mono (amounts/IDs) — with injected Google Fonts links, so printed
  invoices match the on-screen brand.
- Removed the last `index.html` `<link>` duplication concern: the Google Fonts
  link and `body class="font-body"` were already correct.

## Verification
- Grep audit: **zero** `text-[` in `src/`.
- Every `h1`/`h2`/`h3` uses `font-display`; body copy inherits `font-body` from
  the `body` base class.
- `npm run build` passes; `npm test` 7/7 pass.

## Files Touched
`src/App.jsx`, `src/components/UI.jsx`, `src/pages/Invoices.jsx`.
