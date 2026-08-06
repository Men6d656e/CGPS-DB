# 🎨 PROJECT_OVERVIEW4.md — Deep UI Design-System Analysis (Typography, Theme, Radius)

> **Generated:** 2026-08-06 | **Branch:** `my-changes`
> **Scope:** Frontend only (`school-frontend/`)
> **Purpose:** Independent, deep audit of how the shadcn **preset `b7Br6guwa`** (typography, theme colors, radius) is actually used across the app — and where the "color + font inconsistency" you can see visually comes from.
> **Decision basis:** Tokenize brand as accent · normalize to current `--radius` (0.5rem) · keep + formalize the `UI.jsx` composition layer. These become the working assumptions of `SPEC/SPEC4.md`.

---

## 🏁 Executive Verdict

| Question | Answer |
|---|---|
| Is the shadcn **infrastructure** present? | ✅ Yes — `components.json`, `src/components/ui/*` (18 components), tokens in `:root`/`.dark`, `tailwindcss-animate`, `clsx`, `tailwind-merge`, Radix primitives. |
| Is the preset **actually used** everywhere? | ❌ **Partially.** shadcn components follow tokens, but ~94 raw `slate`/`emerald`/`amber`/**`sky`**/**`orange`**/**`brand`**/**`gold`** utilities in pages **bypass the token system** and depend on a fragile legacy remap layer. |
| Is **typography 100% typeset**? | ❌ **No.** `font-body` is global ✅, but `font-display` is applied to only a subset of headings; there is **no preset type-scale system**, one arbitrary `text-[10px]`, and the **print template uses raw Arial**. |
| Is **radius** consistent? | ❌ **No.** `--radius: 0.5rem` is set, but pages hardcode `rounded-xl` (12px) / `rounded-2xl` (16px) in ~20 spots, and icon tiles vary `rounded-lg`/`xl`/`2xl` across the app. |
| Does **dark/light** work robustly? | ⚠️ **Fragile.** ThemeContext + FOUC + `.dark` class are wired correctly, but light mode works only because of a ~60-line `html:not(.dark)` override layer in `index.css` that remaps raw slate utilities. Any missed variant = broken light mode. |

**One-line summary:** The shadcn *scaffolding* landed cleanly in SPEC3, but the **migration stopped halfway** — tokenized components sit next to legacy raw-class pages, producing the visual mismatch you can see. The fix is a **token-consolidation + typography + radius pass** that removes the legacy layer and moves every page onto the preset (see `SPEC/SPEC4.md`).

---

## §1 — Design Token System Audit (two competing systems)

`src/index.css` currently contains **two color systems** that must reconcile:

### A. Shadcn/preset tokens (correct target)
Defined on `:root` and flipped by `.dark`. These power all `components/ui/*`:
```
--background --foreground --card --popover --primary --secondary
--muted --accent --destructive --border --input --ring
--radius: 0.5rem
--chart-1..5
```

### B. Legacy SPEC2 theme layer (must be removed)
```
:root {
  --app-bg: #020617;  --surface: #0f172a;  --surface-2: #1e293b;  --surface-3: #334155;
  --border: #1e293b;  --border-strong: #475569;
  --text-primary: #f1f5f9;  --text-secondary: #e2e8f0;  --text-muted: #94a3b8;  --text-faint: #64748b;
}
html:not(.dark) { ...light overrides... }
```

### The conflict (root cause of the visual mismatch)
- `@layer base body` uses **legacy** vars (`background-color: var(--app-bg); color: var(--text-primary)`) — the app shell backgrounds do **not** come from the preset tokens.
- The two palettes are not the same: `--background` dark is `0 0% 3.9%` (#0a0a0a) while `--app-bg` is `#020617` (slate-950); `--foreground` #0a0a0a vs `--text-primary` #f1f5f9. Slightly different hue no matter the theme.

### C. The `html:not(.dark)` light-mode remap layer (the fragility)
To keep raw-dark classes looking right in light mode, SPEC2/3 added ~60 lines remapping utilities:
```
html:not(.dark) .bg-slate-900/*, .bg-slate-800/40, .text-slate-200, .border-slate-700/60, ...
html:not(.dark) .text-emerald-400, .text-amber-400, .text-brand-400 ...
html:not(.dark) .hover:bg-slate-700...
```
This is **not a design system** — it is a patch that only covers the classes that were enumerated. Anything a page uses that is *not* in this list stays dark in light mode. It also creates **hardcoded-hex churn** (16 hex values + 11 remaps) that fights the token model.

> **Fix direction (SPEC4 Phase 1):** delete legacy `--app-*`/`--text-*` vars, delete the `html:not(.dark)` remap layer, drive `body` from `--background`/`--foreground`, and define explicit semantic tokens for the brand accent + statuses. Verify with grep that no raw classes remain.

---

## §2 — Typography Audit

### Fonts (loaded in `index.html` + `tailwind.config.js`)
| Family | Config key | Used for | Notes |
|---|---|---|---|
| Playfair Display (500/600/700) | `font-display` | Headings, card titles, big values | Applied **inconsistently** (see below) |
| DM Sans (300–600) | `font-body` | Global body (set on `<body class="font-body">`) | ✅ Applied globally |
| JetBrains Mono (400/500) | `font-mono` | Monetary values, IDs, codes | ✅ Used consistently for money (good) |

### Font-* usage counts (in `src/`)
| Utility | Uses | Files |
|---|---|---|
| `font-body` | global (index.html + tailwind base) | — |
| `font-display` | **10** | App, UI.jsx, ErrorBoundary, Dashboard, Login, Users |
| `font-mono` | **26** | Dashboard, Students, Payments, Parents, Invoices, Fees, ErrorBoundary |

### Headings that do NOT use `font-display` (inconsistency)
| Location | Heading | Uses display? |
|---|---|---|
| `App.jsx` header `<h1>` | page title | ✅ |
| `UI.jsx` SectionHeader `<h2>` | section titles | ✅ |
| `UI.jsx` Modal `DialogTitle` | modal titles | ✅ |
| `UI.jsx` `ConfirmModal` `AlertDialogTitle` | confirm titles | ❌ Default |
| `UI.jsx` Table `TableHead` | column headers | ❌ Uses `text-xs uppercase` only |
| `Dashboard` CardTitle | chart/recent titles | ✅ |
| `Login` `<h1>` | brand heading | ✅ |
| `Users` Access-Denied heading | — | ✅ (as `<p>` with `font-display`) |
| `ErrorBoundary` `<h2>` | error heading | ✅ |
| `DropdownMenu` items / other titles | — | ❌ Default |

### Type scale — missing
- There is **no preset-driven font-size scale** in `tailwind.config.js` (only `fontFamily`). Sizes are hardcoded case-by-case: `text-[10px]` (App.jsx role pill), `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`.
- Heading hierarchy is inconsistent: page header `text-lg`, SectionHeader `text-xl`, Login brand `text-2xl` — no defined ladders.

### Print template is outside the design system
`Invoices.jsx` `handlePrint` opens a print window with `font-family: Arial, sans-serif` and raw `#333/#666/#ddd` colors — **Arial is not one of the three design fonts**. A printed receipt should match the app brand.

**Fix (SPEC4 Phase 2):** add a type-scale map (`display`/`heading`/`body`/`label`/`mono`), apply `font-display` to *every* heading title (incl. AlertDialog + table headers + dropdown), replace arbitrary `text-[10px]`, and rebuild the print stylesheet on the design fonts.

---

## §3 — Color Audit

### Raw utilities that bypass tokens (must be migrated)
| Pattern | Count (in `src/`) | Where |
|---|---|---|
| `text-slate-*` | **69** | Students, Teachers, Parents, Fees, Invoices, Payments, Users, UI.jsx |
| `bg-slate-*` | **19** | Students, Fees, Invoices, Payments, UI.jsx, Users |
| `border-slate-*` | **6** | Fees, Users, UI.jsx |
| `text/bg/border-emerald`, `-amber`, `-sky`, `-orange`, `-red` | **~40** | UI.jsx, Dashboard, Invoices, Payments, Users, ErrorBoundary |
| `brand-*` (sky) | **17** | UI.jsx, Login, Fees, Parents, Students, Teachers, Users, App.jsx |
| `gold-*` | **1** | Login |
| `text-white` | 2 | App.jsx, Login (logo icons on gradient — acceptable) |
| `bg-gradient` | 2 | App.jsx, Login (logo — acceptable) |

### Two color idioms competing
1. **Tokenized** (shadcn): `text-foreground`, `text-muted-foreground`, `bg-muted`, `bg-card`, `bg-accent`, `text-destructive`, `text-primary`, `border-border`, `border-destructive`. Used across `components/ui/*`, `App.jsx` shell, `UI.jsx` (partially), form controls.
2. **Raw** (legacy) : `text-slate-200` (primary text), `text-slate-400/500` (muted), `bg-slate-800/xx` (surfaces), `border-slate-7xx/6xx` (borders), `text-emerald-400` (paid/collected), `text-amber-400` (pending/balance), `text-red-400` (overdue/error), `text-brand-400` (links/icons/accent).

> Impact: **two hero colors** — everywhere the app is drawn, one system wins; at the borders it’s a thin token. The `text-slate-200`/`text-emerald-400` style is *dark-only*; in light it only renders because of the §1 remap layer.

### Status color map (ad-hoc, not tokenized)
`UI.jsx` `STATUS_STYLES` raw mapping:
| Status | Class |
|---|---|
| active / paid | `emerald` |
| withdrawn / inactive | `slate` |
| resigned / pending | `amber` |
| graduated | `sky` |
| partial | `orange` |
| overdue | `red` |

This is a reasonable semantic map, but each uses raw `bg-xxx-500/15 text-xxx-600 dark:text-xxx-400 border-xxx-500/25` strings — **not** the preset’s token set and not the chart palette. It also drives the `uiComponents.test.jsx` assertion on `bg-red-500/15` (brittle).

### Billboard/Chart
- Dashboard chart uses `hsl(var(--chart-1))` / `var(--chart-3)` → ✅ tokenized.
- But the “Outstanding Balance” banner uses raw `border-amber-500/30 bg-amber-500/5` + `text-amber-400`; Payments “Total Collected” card uses raw `border-emerald-500/30 bg-emerald-500/5` + `text-emerald-400`. Inconsistent with the chart tokens.

**Fix (SPEC4 Phase 3):** a global Mapping Table (`slate-200 → foreground`, `slate-400/500 → muted-foreground`, `bg-slate-800/x → bg-muted`, `border-slate-7xx/6xx → border-border`, `emerald→paid/success token`, `amber→pending token`, `orange→partial token`, `red→destructive`, `sky→info`, `brand→accent`) and refactor `STATUS_STYLES` onto those tokens.

---

## §4 — Radius Audit

`--radius: 0.5rem` is set; tailwind maps `lg=var(--radius)=8px`, `md=6px`, `sm=2px`. shadcn components consistently use `rounded-md`/`rounded-lg`/`rounded-sm` (✅ follow the token).

**Pages/components hardcode non-token radii:**
| Token | Uses | Where |
|---|---|---|
| `rounded-xl` (12px) | ~15 | Fees overrides, Students/Parents/Teachers detail boxes, Invoices panels, Payments panels, Dashboard tooltip, StatCard icon, Table container |
| `rounded-2xl` (16px) | ~5 | Login card logo, EmptyState icon, Users access icon, ErrorBoundary icon |
| `rounded-lg` | several | Sidebar logo, Avatar, Students class chip, Payments INV chip, alert-dialog etc. (shadcn-native), |
| `rounded-full` | several | pills/status badges (acceptable) |

**Icon-tile radius is inconsistent** (should be uniform):
| Icon tile | Radius |
|---|---|
| Sidebar logo (App) | `rounded-lg` |
| Login logo | `rounded-2xl` |
| StatCard icon | `rounded-xl` |
| EmptyState icon | `rounded-2xl` |
| Users access-denied icon | `rounded-2xl` |
| ErrorBoundary icon | `rounded-2xl` |
| Fees fee-type icon | `rounded-xl` |

**Fix (SPEC4 Phase 4):** define a radius scale with a rule table:
- Outer containers (cards / dialogs / detail sheets) → `rounded-lg`
- Nested inner tiles / icon tiles → `rounded-md` (or a single token)
- Chips / pills / badges / avatar → `rounded-full`
Then remove the literal `rounded-xl`/`rounded-2xl` occurrences. (Print CSS uses 8px — fine.)

---

## §5 — Component Layer & Hygiene

### `UI.jsx` is a composition layer, not dead code
SPEC3 Phase 6 documentation and README claim `UI.jsx` **was deleted** — it was not. It was **refactored** into a thin composition layer over the shadcn primitives:
`Spinner`, `PageLoader`, `EmptyState`, `ErrorAlert`, `Modal` (Dialog), `ConfirmModal` (AlertDialog), `StatCard`, `Field`, `StatusBadge`, `SectionHeader`, `Table`, `Pagination`.

This is actually a **good** architecture (reuse across the 8 pages). The only problems:
- Its internals still contain raw classes (`bg-brand-500`, `text-brand-400`, `text-emerald/amber`, `rounded-xl/2xl`).
- The docs don’t reflect reality (spec-driven drift).

**Decision (user):** keep + formalize rather than delete. (SPEC4 Phase 5 re-skills its internals to tokens/scale/radius and documents it accurately.)

### Hygiene
| Item | State |
|---|---|
| `next-themes` in `package.json` | ⚠️ **Unused** (0 refs in src; custom `ThemeContext` does the job). Remove. |
| `clsx` | Used by `lib/utils.js` but **missing from `package.json`** (resolved transitively, v2.1.1). Add as a direct dep. |
| `favicon.svg` | ✅ Now present in `dist/` and `public/` (was 404 in SPEC2’s audit — fixed). |
| Tests | 7 passing; `uiComponents.test.jsx` `StatusBadge` assertion now uses the semantic `bg-destructive/15` token (spec4 token refactor). |

---

## §6 — Metrics at a glance

| Metric | Value |
|---|---|
| Shadcn components in `ui/` | 18 |
| Raw `text-slate` utilities in pages | 69 |
| Raw `bg-slate` / `border-slate` | 25 |
| Raw semantic colors (emerald/amber/sky/orange/red) | ~40 |
| Raw `brand`/`gold` utilities | 6 |
| Hardcoded hex in `index.css` overrides | 16 + 11 accent shade |
| `font-display` uses | 10 (should be every heading) |
| `rounded-xl` / `rounded-2xl` literals | ~20 |
| Legacy theme-vars + `html:not(.dark)` remap lines | ~80 |

---

## ✅ 7. Honest Verdict

**What is verified good:**
- ✅ Shadcn infra + 18 components initialized from preset `b7Br6guwa`.
- ✅ ThemeContext + FOUC + `.dark` class strategy are correctly wired for toggling.
- ✅ `font-body` is global; JetBrains Mono is consistently used for money/IDs.
- ✅ `body` gradient + rounded layout skeleton is sane.
- ✅ Build passes; 7 tests green.

**What is broken / inconsistent (the visible problem):**
- ❌ **Two competing color systems**; `body` uses legacy vars, not preset tokens.
- ❌ **Light mode depends on a fragile remap layer**, so a miss = broken light.
- ❌ **Raw utilities dominate** the pages (69 + slate, ~40 semantic, 14 brand).
- ❌ **`font-display` not applied everywhere** + no typeset scale + Arial in print.
- ❌ **Radius hardcoded** (`rounded-xl/2xl`) and icon tiles inconsistent.
- ❌ **Docs drift** (`UI.jsx` deletion claim is false) and unused `next-themes`.

**Bottom line:** This is a *completion* problem, not a redo — finish the token adoption with a disciplined color/typography/radius pass (SPEC4) and the app will render as one consistent, preset-compliant design system in both light and dark.

---

*End of PROJECT_OVERVIEW4.md — source for `SPEC/SPEC4.md`.*