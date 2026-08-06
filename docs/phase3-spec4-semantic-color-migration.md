# Phase 3 — SPEC4 Semantic Color Migration

**Date:** 2026-08-06
**Milestone:** shadcn preset-4 adoption (SPEC/SPEC4.md)
**Scope:** frontend only (`school-frontend/src`)

## Goal
Eliminate raw palette utilities from app code. Every `text/bg/border-{slate,
emerald, amber, sky, orange, red, brand, gold, …}` class in pages/components is
replaced with a semantic token class backed by the Phase 1 CSS variables —
single source of truth for light + dark mode, no `dark:` toggling.

## Mapping Table Applied (from SPEC4)
| Raw | Token |
| --- | --- |
| `slate-200` text | `text-foreground` |
| `slate-400/500` text | `text-muted-foreground` |
| `bg-slate-800/x`, `bg-white/x` surfaces | `bg-muted`, `bg-card`, `bg-background` |
| `border-slate-7xx/x` | `border-border` |
| `text-emerald-400`, `text-green-*` (paid/collected) | `text-success` |
| `text-amber-400` (pending/balance) | `text-warning` |
| `text-orange-*` (partial) | `text-partial` |
| `text-sky-400` (info) | `text-info` |
| `text-red-400` (overdue/error) | `text-destructive` |
| `text-brand-*`, `bg-brand-*`, `border-brand-*` | `text-accent-brand`, `bg-accent-brand/*`, `border-accent-brand/*` |

## Changes
- **`STATUS_STYLES`** rewrote onto tokens (no `dark:` prefixes — CSS vars
  adjust lightness automatically):
  `active`→`bg-success/15 text-success border-success/25`, `withdrawn`/
  `inactive`→`bg-muted/50 text-muted-foreground border-border`,
  `graduated`→`bg-info/15 text-info border-info/25`, `partial`→`bg-partial/15
  text-partial border-partial/25`, `overdue`→`bg-destructive/15 text-destructive
  border-destructive/25`.
- **`StatCard`** `iconColor` map → token-based (`brand`, `success`, `warning`,
  `destructive`, `info` keys), dropped redundant `dark:` variants; Dashboard
  hero amber → `text-warning`.
- **Brand rename:** the `brand` tailwind slot is now **`accent-brand`**
  (SPEC4 §design contract, avoiding the shadcn `--accent` collision). All 20+
  usages migrated: `text-brand` → `text-accent-brand`, `bg-brand/10` →
  `bg-accent-brand/10`, `border-brand/20` → `border-accent-brand/20`,
  `from-brand to-brand-strong` → `from-accent-brand to-accent-brand-strong`,
  `shadow-brand/30` → `shadow-accent-brand/30`, `hover:text-brand/80` →
  `hover:text-accent-brand/80`.
- **Audit-fixed residuals** the bulk sed missed: `text-amber-600`, `bg-slate-500`
  bits and no-op `hover:text-brand` on raw anchors were cleaned by hand.
- Intentionally retained: `bg-black/…`/`text-white` (scrims, logo) and
  `alert.jsx`'s `dark:border-destructive` (inside `packages/ui/*`, preset-owned).

## Verification
- Grep audit `(text|bg|border|from|to|shadow)-(slate|brand|gold|emerald|amber|
  sky|orange|red)` outside `components/ui/*` → **CLEAN**.
- No `dark:` class toggles in app code.
- Token classes confirmed emitted in built CSS (Tailwind 3.4 `hsl(var(--x) /
  .15)` opacity syntax verified in `dist/assets`).
- `npm test` 8/8 pass; build passes.

## Files Touched
`src/App.jsx`, `src/components/UI.jsx`, `tailwind.config.js` (slot rename),
and pages `Dashboard`, `Students`, `Teachers`, `Parents`, `Payments`, `Users`,
`Fees`, `Login`.
