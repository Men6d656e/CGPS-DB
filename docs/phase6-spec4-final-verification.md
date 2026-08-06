# Phase 6 — SPEC4 Final Verification Gate

**Date:** 2026-08-06
**Milestone:** shadcn preset-4 adoption (SPEC/SPEC4.md)
**Scope:** frontend only (`school-frontend/src`)

## Goal
Close out SPEC4 with a full quality gate — tests, lint, build, and the hard
`grep` audits that verify the design-system contract holds across the entire
source tree.

## Audit Results (all pass)
| Audit | Rule | Result |
| --- | --- | --- |
| Raw color utilities | no `text/bg/border-{red,green,slate,gray,gold,brand,N}` outside `packages/ui/*` | ✅ CLEAN |
| Arbitrary text sizes | no `text-[…]` | ✅ CLEAN |
| Radius drift | no `rounded-xl/2xl` outside shadcn `card.jsx` | ✅ CLEAN |
| Dark-mode class toggles | no `dark:` outside `packages/ui/*` | ✅ CLEAN |
| Stale deps | no `next-themes` / `react-hot-toast` refs in `src/` or `package.json` | ✅ CLEAN |
| Lint | `eslint src/` | 0 errors, 5 pre-existing `exhaustive-deps` warnings |
| Tests | `vitest` | ✅ 7/7 pass |
| Build | `vite build` | ✅ passes |

## Notes on the 5 lint warnings
`react-hooks/exhaustive-deps` on `load` in `useEffect` for `Students`,
`Teachers`, `Parents`, `Payments`, `Users`. These are pre-existing across the
page set and unrelated to the design-system pass; fixing them (extra deps on
memoized loaders) is out of scope and risk-laden, so they are left as warnings.

## Test coverage (SPEC4 additions)
- `uiComponents.test.jsx` `StatusBadge` assertion updated from the old raw
  `bg-red-500/15` slice to the semantic `bg-destructive/15` token class it now
  emits — the "landmine" identified in earlier phases was already resolved in
  the working tree and keeps the token-migration contract under test.

## Delivered / closed
- Design tokens: `--accent-brand`, `--accent-brand-strong`, `--success`,
  `--warning`, `--partial`, `--info` (light + dark) in `index.css`.
- Typography: `font-display`/`font-body`/`font-mono` enforced project-wide;
  zero arbitrary text sizes.
- Radius: `--radius: 0.5rem`, `rounded-md` standard, `rounded-xl` preserved
  only on shadcn `Card`.
- `UI.jsx` formalized as the app composition layer (a11y + focus presented in
  `phase5-spec4-component-layer-finalization.md`).
- README + `project-overview4.md` updated; stale `UI.jsx`-delete and
  react-hot-toast claims corrected.