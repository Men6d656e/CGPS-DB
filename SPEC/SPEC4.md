# 📋 SPEC4 — Design System Consolidation: Typography · Theme · Radius

> **Created:** 2026-08-06 | **Branch:** `my-changes`
> **Source:** [project-overview4.md](../project-overview4.md) — deep UI design-system analysis
> **Purpose:** Finish the shadcn preset (`b7Br6guwa`) adoption that SPEC3 left halfway. Remove the legacy dual color system, enforce **100% typeset typography**, normalize **radius** to the token scale, and formalize the **`UI.jsx` composition layer** — so the app renders as one consistent design system in light + dark.
> **Scope:** Frontend only (`school-frontend/`). Backend untouched.
> **Decisions (confirmed):** ① Tokenize brand sky-blue as a semantic **accent** (not raw `brand-*`). ② Normalize radius to current `--radius: 0.5rem`. ③ Keep + formalize `src/components/UI.jsx` (composition layer) rather than delete.

---

## 🎯 Goal

Every `class=` in `src/` must be one of:
1. A **shadcn semantic token** (`text-foreground`, `bg-muted`, `border-border`, `text-destructive`, …), or
2. A **defined accent/status token** (this spec introduces them), or
3. A **type-scale / radius-scale utility** from the tables below.

**Zero** raw `slate-*`, `brand-*`, `gold-*`, `emerald-*`, `amber-*`, `sky-*`, `orange-*`, `red-*` literals, and **zero** hardcoded `rounded-xl`/`rounded-2xl` in `src/` by the end of Phase 6.

---

## 📐 Design Contract (single source of truth — every phase references this)

### Token strategy (light on `:root`, dark on `.dark`)
Add to `src/index.css` (replacing the legacy SPEC2 layer):

```css
:root {
  --accent: 199 89% 48%;            /* brand sky-blue → "school accent" */
  --accent-foreground: 0 0% 100%;
  --success: 142 71% 45%;           /* emerald — paid / active */
  --warning: 38 92% 50%;            /* amber — pending / resigned */
  --partial: 24 95% 53%;            /* orange — partial */
  --info: 199 89% 48%;              /* sky — graduated */
}
.dark {
  --accent: 199 89% 55%;
  --accent-foreground: 0 0% 9%;
  --success: 142 71% 45%;
  --warning: 38 92% 50%;
  --partial: 24 95% 53%;
  --info: 199 89% 55%;
}
```

`tailwind.config.js` gains: `accent`/`success`/`warning`/`partial`/`info` color slots (hsl-var style, same as existing primary/muted/accent), and the `fontSize` scale + `fontFamily` extension from the Type Scale below.

> Note: `--accent` (brand) and shadcn’s built-in `--accent` (muted hover) share a name. To avoid confusion this spec renames the shadcn muted-hover accent usage stays as-is and the **brand** becomes `--accent-brand`. Mapping table below uses `bg-accent-brand`, `text-accent-brand`, `border-accent-brand/20`.

### Type scale
```js
fontSize: {
  xs:  ['0.75rem', { lineHeight: '1rem' }],
  sm:  ['0.8125rem', { lineHeight: '1.25rem' }],
  base:['0.875rem', { lineHeight: '1.5rem' }],   /* body base */
  lg:  ['1.0625rem', { lineHeight: '1.5rem' }],
  xl:  ['1.25rem',   { lineHeight: '1.75rem' }],
  '2xl':['1.5rem',   { lineHeight: '2rem' }],
}
```

### Radius scale (rule table)
| Element | Token |
|---|---|
| Outer cards / dialogs / detail sheets | `rounded-lg` (var(--radius)) |
| Nested inner tiles / info boxes / overrides | `rounded-md` |
| Icon tiles (logo, stat, empty, error) | `rounded-md` |
| Chips / pills / badges / avatar / status | `rounded-full` |

### Raw → Token color mapping (used by Phase 3)
| Raw (dark idiom) | Replace with |
|---|---|
| `text-slate-100/200` | `text-foreground` |
| `text-slate-300` | `text-foreground` (or `text-muted-foreground` for secondary) |
| `text-slate-400` | `text-muted-foreground` |
| `text-slate-500` / `text-slate-600` | `text-muted-foreground` |
| `bg-slate-800` (+opacity) | `bg-muted` |
| `bg-slate-900/50`, `bg-slate-900/30` | `bg-muted/50` |
| `border-slate-700/60`, `border-slate-800/60` | `border-border` |
| `text-emerald-400/500`, `bg-emerald-500/x`, `border-emerald-500/x` | `text-success` / `bg-success/x` / `border-success/x` |
| `text-amber-400/500` … | `text-warning` / `bg-warning/x` / `border-warning/x` |
| `text-orange-400` … | `text-partial` / `bg-partial/x` / `border-partial/x` |
| `text-sky-400` … | `text-info` / `bg-info/x` / `border-info/x` |
| `text-red-400/500` … | `text-destructive` / `bg-destructive/x` / `border-destructive/x` |
| `text-brand-400/500`, `bg-brand-500/x`, `border-brand-500/x` | `text-accent-brand` / `bg-accent-brand/x` / `border-accent-brand/x` |
| `bg-gold-400/5`, `bg-gold-400` | `bg-warning/x` (decorative) or remove |

`STATUS_STYLES` (in `UI.jsx`) becomes token-based:
| Status | Style |
|---|---|
| active / paid | `bg-success/15 text-success border-success/25` |
| withdrawn / inactive | `bg-muted text-muted-foreground border-border` |
| resigned / pending | `bg-warning/15 text-warning border-warning/25` |
| graduated | `bg-info/15 text-info border-info/25` |
| partial | `bg-partial/15 text-partial border-partial/25` |
| overdue | `bg-destructive/15 text-destructive border-destructive/25` |

---

## Phase 1: Token Foundation & Theme Decoupling 🧱

**Priority:** CRITICAL | **Est. Effort:** 2-3h | *Must land before all other phases (everything depends on the tokens existing).*

### Tasks
1. In `src/index.css`:
   - **Delete** the legacy `:root { --app-bg … }` + `html:not(.dark) { --app-bg … }` blocks.
   - **Delete** the entire `html:not(.dark) …` light-override remap layer (all `slate`/`brand`/`emerald`/`amber` remaps).
   - Add the **Design Contract** accent/status tokens above.
   - Rewire `@layer base body`: `background-color: hsl(var(--background)); color: hsl(var(--foreground));` (keep `font-body antialiased` + transition; move the decorative radial-gradients behind a light/dark-aware token or remove them this phase).
2. In `tailwind.config.js`: add `accent-brand`, `success`, `warning`, `partial`, `info` color slots (hsl-var). Keep `--radius: 0.5rem` mapping. Add the Type Scale `fontSize` block.
3. `package.json`: remove `next-themes`; add `clsx` (`^2.1.1`) to dependencies.
4. Update `index.html`: nothing to change for theme (FOUC + fonts already correct). Keep the font link.
5. **Leave all page/component classes untouched this phase** — the app will temporarily look wrong where raw classes relied on the deleted remap layer; that is expected and fixed by Phase 3. Verify only that the app still **builds** and token surfaces work.

### Files to Modify
- `school-frontend/src/index.css`
- `school-frontend/tailwind.config.js`
- `school-frontend/package.json` (+ lockfile via `npm install`)

### Verification
- [ ] `grep -rn "app-bg\|--surface\|html:not(.dark)\|--text-primary" src/index.css` → **empty**
- [ ] `grep -rn "next-themes" src/ package.json` → **empty**
- [ ] `npm run build` passes
- [ ] Light/dark toggle still toggles `.dark`; shadcn components + dialogs still render token colors

### Workflow
1. ⬜ Code → 2. ⬜ `npm run build` → 3. ⬜ `docs/phase1-spec4-token-foundation.md` → 4. ⬜ Update README → 5. ⬜ Commit `feat(phase1-spec4): token foundation and theme decoupling` → 6. ⬜ Push

---

## Phase 2: Typography System — 100% Typeset ✍️

**Priority:** HIGH | **Est. Effort:** 2-3h

### Tasks
1. Apply the **Type Scale** (already in config from Phase 1) and delete arbitrary sizes:
   - `App.jsx` role pill `text-[10px]` → `text-xs`.
   - Ensure `font-body` is the default everywhere (it is via `<body class="font-body">`; do not re-apply per element).
2. Apply `font-display` to **every** heading/title:
   - `UI.jsx`: `ConfirmModal` `AlertDialogTitle`, `Table` `TableHead` (add `font-display` alongside the `text-xs uppercase`), `EmptyState` title.
   - `ui/*`: confirm titles (`alert-dialog.jsx`, `dialog.jsx`) get `font-display` via `Modal`/`ConfirmModal` wrappers; `DropdownMenu` labels stay body.
   - Pages: any `<h1>/<h2>/<h3>`/CardTitle/SectionHeader already covered; sweep for stragglers with the grep below.
3. Keep JetBrains Mono for money/IDs (already consistent — do not change).
4. Rebuild the **invoice print template** (`Invoices.jsx` `handlePrint`) to use the design fonts:
   - `font-family: 'Playfair Display', serif` for the school name / title; `font-family: 'DM Sans', sans-serif` for body; keep `monospace` for the amounts.
   - Replace raw `#333/#666/#ddd/#f5f5f5` with a small print palette (near-neutral) — or, since print runs outside the app, use the same hex consistently (documented).
5. Fix heading hierarchy: page header (App) `text-lg`, SectionHeader `text-xl`, Login brand `text-2xl` — make all three `font-display`; adjust to the scale.

### Files to Modify
- `src/App.jsx`, `src/components/UI.jsx`, `src/components/ui/alert-dialog.jsx`, `src/components/ui/dialog.jsx` (if needed), `src/pages/*.jsx` (heading sweep), `src/pages/Invoices.jsx` (print CSS)

### Verification
- [ ] `grep -rn "text-\[" src/` → **empty**
- [ ] Every rendered title node has `font-display` (spot-check the 8 pages + modals + error boundary)
- [ ] Print preview shows DM Sans / Playfair (not Arial)
- [ ] `npm run build` + `npm test` pass

### Workflow
1. ⬜ Code → 2. ⬜ `npm test` + `npm run build` → 3. ⬜ `docs/phase2-spec4-typography.md` → 4. ⬜ README → 5. ⬜ Commit `feat(phase2-spec4): 100% typeset typography` → 6. ⬜ Push

---

## Phase 3: Semantic Color Migration 🎨

**Priority:** HIGH | **Est. Effort:** 4-5h

### Tasks
1. Apply the **Raw → Token mapping table** across every page + `UI.jsx` + `ErrorBoundary.jsx`:
   - Students, Teachers, Parents, Fees, Invoices, Payments, Users, Dashboard, Login.
   - Replace `text-slate-*`/`bg-slate-*`/`border-slate-*`, `text-emerald/amber/sky/orange/red-*`, `brand-*`, `gold-*` with the mapped tokens.
2. Refactor `STATUS_STYLES` in `UI.jsx` to the token table (see Design Contract).
3. Tokenize Dashboard banner + Payments “Total Collected” card (raw amber/emerald → `border-warning/x bg-warning/x text-warning` and `border-success/x bg-success/x text-success`).
4. Replace `bg-gradient-to-br from-brand-500 to-brand-700` (App + Login logos) with `bg-accent-brand` + a subtle gradient from `accent-brand` to a darker shade token (define `--accent-brand-strong` or use `from-accent-brand to-accent-brand/80`).
5. Status pills in Students table (raw select-trigger chip) and Users role chip → token classes.

### Files to Modify
- All 9 pages, `src/components/UI.jsx`, `src/components/ErrorBoundary.jsx`, `src/components/ThemeToggle.jsx` (verify), `tailwind.config.js` (tokens already), `src/index.css` (verify no raw color utilities remain)

### Verification
- [ ] `grep -rnE "(text|bg|border|hover:bg|hover:text)-(slate|emerald|amber|sky|orange|red|brand|gold)" src/` → **empty** (except `uiComponents.test.jsx`, fixed in Phase 6)
- [ ] `npm run build` + `npm test` pass
- [ ] Browser: light + dark on all 9 pages; badges/banners/tooltips read correctly in light mode (no unreadable dark-on-light)

### Workflow
1. ⬜ Code → 2. ⬜ `npm test` + `npm run build` → 3. ⬜ `docs/phase3-spec4-color-migration.md` → 4. ⬜ README → 5. ⬜ Commit `feat(phase3-spec4): semantic color migration` → 6. ⬜ Push

---

## Phase 4: Radius Normalization 📐

**Priority:** MEDIUM | **Est. Effort:** 2-3h

### Tasks
1. Apply the **Radius scale rule table** across `src/`:
   - `rounded-xl` → `rounded-lg` (outer) or `rounded-md` (nested/icon tiles) per table.
   - `rounded-2xl` → `rounded-lg` for large containers / `rounded-md` for icon tiles.
   - Keep `rounded-full` for pills/badges/avatar/switch.
2. Unify icon tiles (sidebar logo, Login logo, StatCard, EmptyState, Users access icon, ErrorBoundary icon, Fees icon) on `rounded-md`.
3. Detail-sheet info boxes (Students/Parents/Teachers/Invoices/Payments), Fees override panels, Payments INV chip → `rounded-md`.
4. Confirm shadcn components keep their preset values (`rounded-md`/`lg`/`sm`) — do not restyle `ui/*`.

### Files to Modify
- All pages with `rounded-xl`/`rounded-2xl` literals, `src/components/UI.jsx`, `src/components/ErrorBoundary.jsx`

### Verification
- [ ] `grep -rn "rounded-xl\|rounded-2xl" src/` → **empty** (except nothing in `ui/*`)
- [ ] `npm run build` + `npm test` pass
- [ ] Visual pass: cards/nested/icon-tile radius reads as one consistent system

### Workflow
1. ⬜ Code → 2. ⬜ `npm test` + `npm run build` → 3. ⬜ `docs/phase4-spec4-radius-normalization.md` → 4. ⬜ README → 5. ⬜ Commit `feat(phase4-spec4): radius normalization` → 6. ⬜ Push

---

## Phase 5: Component Layer Finalization 🧩

**Priority:** MEDIUM | **Est. Effort:** 2-3h

### Tasks
1. Formalize `src/components/UI.jsx` as the **domain composition layer** (documented, kept — NOT deleted):
   - Confirm every primitive’s internals use tokens/scale/radius (post Phase 3/4 they should).
   - Add consistent `focus-visible:ring-2 ring-ring ring-offset-background transition-colors` to interactive compositions where missing.
   - Ensure `Modal`/`ConfirmModal` follow a11y (a11y description already added in SPEC3; keep).
2. Fix status-badge contrast in **light mode** (token `text-success`/`text-warning`/`text-partial` must meet WCAG AA on their `bg-x/15`).
3. Audit `aria-*` on `StatusBadge`/select chips (add `aria-label` where icon-only).
4. Correct the docs drift: update README + `docs/phase6-shadcn-cleanup.md` to state that `UI.jsx` is a **kept composition layer** (the SPEC3 “deleted” claim was wrong).
5. Optional hardening: `cn()` already used by `ui/*`; adopt it inside `UI.jsx` compositions for tailwind-merge safety.

### Files to Modify
- `src/components/UI.jsx`, `src/components/ui/*` (only if a11y/contrast fixes needed), `README.md`, `docs/phase6-shadcn-cleanup.md`

### Verification
- [ ] `UI.jsx` internals contain no raw colors / off-scale radii (grep clean from Phase 3/4)
- [ ] Status badges pass a contrast spot-check in light mode (Lighthouse axe or manual)
- [ ] README reflects the kept composition layer
- [ ] `npm test` + `npm run build` pass

### Workflow
1. ⬜ Code → 2. ⬜ `npm test` + `npm run build` → 3. ⬜ `docs/phase5-spec4-component-layer.md` → 4. ⬜ README → 5. ⬜ Commit `feat(phase5-spec4): component layer finalization` → 6. ⬜ Push

---

## Phase 6: Verification, Tests & Docs ✅

**Priority:** MEDIUM | **Est. Effort:** 2-3h

### Tasks
1. Update `src/__tests__/uiComponents.test.jsx` — replace the `bg-red-500/15` assertion with the token-based `STATUS_STYLES` (e.g. assert `text-destructive` or the new class) so it survives the refactor.
2. Add a small test that snapshots the token surface: render `Badge`/`StatusBadge` and assert the class does not contain `slate`/`brand` (guards against regression).
3. Run the **full gate**: `npm test`, `npm run build`, `npx eslint src`.
4. Grep audits (final):
   - `grep -rnE "(text|bg|border)-(slate|brand|gold|emerald|amber|sky|orange|red)" src/` → **empty**
   - `grep -rn "rounded-xl\|rounded-2xl\|text-\[" src/` → **empty**
   - `grep -rn "next-themes\|react-hot-toast" src/ package.json` → **empty**
5. Browser pass: light + dark on all 9 pages + modals + toasts + print preview.
6. Docs: finalize `project-overview4.md` status, update README overview table, note SPEC4 completion.

### Files to Modify
- `src/__tests__/uiComponents.test.jsx`, `docs/*` (new phase docs + spec3-cleanup correction), `README.md`

### Verification
- [ ] All three audits above return zero matches
- [ ] `npm test` (≥7), `npm run build`, `npx eslint src` pass
- [ ] Light + dark browser pass on all 9 pages + print preview

### Workflow
1. ⬜ Code → 2. ⬜ Full gate → 3. ⬜ `docs/phase6-spec4-verification.md` → 4. ⬜ README → 5. ⬜ Commit `feat(phase6-spec4): verification tests and docs` → 6. ⬜ Push

---

## 📊 Progress Tracking

| Phase | Status | Tests | Docs | Committed |
|---|---|---|---|---|
| Phase 1: Token Foundation & Theme Decoupling | ✅ | ✅ | ✅ | ✅ |
| Phase 2: Typography System (100% typeset) | ✅ | ✅ | ✅ | ✅ |
| Phase 3: Semantic Color Migration | ✅ | ✅ | ✅ | ✅ |
| Phase 4: Radius Normalization | ✅ | ✅ | ✅ | ✅ |
| Phase 5: Component Layer Finalization | ✅ | ✅ | ✅ | ✅ |
| Phase 6: Verification, Tests & Docs | ✅ | ✅ | ✅ | ✅ |

---

## ⚠️ Key Risks

1. **Temporary visual break in Phase 1** — deleting the remap layer before Phase 3 migrates pages will leave raw-dark classes looking wrong in light mode. Mitigate: land Phase 1 → Phase 3 back-to-back; keep commits atomic per phase.
2. **`--accent` naming collision** — shadcn already has `--accent` (muted hover). This spec uses `--accent-brand` for the brand to avoid clobbering it. Do not rename the built-in.
3. **StatusBadge test brittleness** — `uiComponents.test.jsx` asserts a raw class; it must move to token assertions in Phase 6 or the test breaks in Phase 3.
4. **Print CSS is out-of-app** — fonts must be re-requested in the print window (embed the same Google Fonts `<link>` in the print doc or fall back to system serif/sans that match).
5. **Chart palette** — `--chart-1..5` stay; keep banner/status colors distinct from chart colors to avoid visual confusion.

---

## 🔄 Workflow Summary

Each phase: **Code → Test (`npm test` + `npm run build`, Phase 6 adds `npx eslint src`) → Docs (`docs/phaseN-spec4-*.md`) → Update README → Commit (`feat(phaseN-spec4): …`) → Push to `my-changes`**.

---

*This spec is a living document. Update status as phases are completed. Derived from `project-overview4.md`.*