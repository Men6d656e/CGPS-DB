# 📋 SPEC3 — Shadcn/UI Migration Plan

> **Created:** 2026-08-06 | **Branch:** `my-changes`
> **Purpose:** Replace the application's raw/custom UI with shadcn/ui components, following the selected preset (`b7Br6guwa`) for typography, theme colors, and radius
> **Workflow:** Each phase follows → Code → Test → Create Docs → Update README → Commit + Push

---

## 🎯 Overview

The frontend was built with **raw Tailwind + hand-rolled components** instead of shadcn/ui. There is currently **no shadcn infrastructure at all** — no `components.json`, no `src/components/ui/`, no Radix primitives, no `class-variance-authority` / `tailwind-merge` / `tailwindcss-animate` (only `clsx` is present).

This spec migrates the entire UI to **shadcn/ui initialized from the selected preset**:

```bash
npx shadcn@latest init --preset b7Br6guwa --template vite --yes
```

The preset defines the **typography, theme colors, and radius** that every component must follow. All raw selectors and hand-rolled components are replaced with shadcn components, and the SPEC2 custom theme layer (CSS variables + light overrides) is folded into shadcn's standard token system (`.dark` class strategy — already compatible with our `ThemeContext`).

---

## 🔍 Raw / Custom Code Inventory (what must be replaced)

### A. Custom CSS classes in `src/index.css` (delete after migration)
| Custom selector | Replace with |
|---|---|
| `.btn-primary` / `.btn-secondary` / `.btn-danger` | `Button` (`default` / `outline` / `secondary` / `destructive` / `ghost` variants) |
| `.input` | `Input`, `Textarea` |
| `.label` | `Label` |
| `.card` / `.card-hover` | `Card` (`CardHeader`, `CardContent`, etc.) |
| `.badge`, `.badge-active`, `.badge-withdrawn`, `.badge-graduated`, `.badge-pending`, `.badge-partial`, `.badge-paid`, `.badge-overdue` | `Badge` with variant mapping |
| `.table-row`, `.th`, `.td` | `Table` (`TableRow`, `TableHead`, `TableCell`, `TableHeader`, `TableBody`) |
| Custom `--app-bg`, `--surface`, `--text-*` vars + `html:not(.dark)` light-override layer (SPEC2 Phase 5) | shadcn CSS variables (`--background`, `--foreground`, `--card`, `--primary`, `--radius`, …) with `.dark` overrides from the preset |

### B. Hand-rolled components in `src/components/UI.jsx` (delete file after migration)
| Custom component | Shadcn replacement |
|---|---|
| `Modal` | `Dialog` |
| `ConfirmModal` | `AlertDialog` |
| `Table` | `Table` (shadcn) |
| `Pagination` | `Pagination` |
| `Select` | `Select` (Radix) |
| `Field` | `Label` (+ optional `Form`) |
| `StatusBadge` | `Badge` |
| `StatCard` | `Card` composition |
| `EmptyState` | `Card` + typography |
| `ErrorAlert` | `Alert` |
| `SectionHeader` | `CardHeader` / heading |
| `Spinner` / `PageLoader` | `Loader2` + `Button` loading state / `Skeleton` |

### C. Other raw code
| Location | Replace with |
|---|---|
| `src/components/LoadingSkeleton.jsx` | shadcn `Skeleton` |
| `src/components/ThemeToggle.jsx` | `Button` (`variant="ghost"`, `size="icon"`) + `Moon`/`Sun` |
| `src/components/ErrorBoundary.jsx` | shadcn `Button` + `Alert` styling |
| `react-hot-toast` (`main.jsx` + 8 pages) | **sonner** (shadcn toast) |
| Raw `<select className="input">` (Students, Users, Fees) | shadcn `Select` |
| Raw `<input className="input">` (~40×), `<textarea>` (~4×), `<button className="btn-*">` (~45×) | `Input`, `Textarea`, `Button` |
| `App.jsx` sidebar/header/nav/top-bar | shadcn `Sidebar`/`Button`/`Separator` with token colors |
| `Dashboard.jsx` stat cards + banners | `Card` / `Alert` (recharts chart stays, colored via tokens) |

### D. Preset compliance (must follow the `b7Br6guwa` preset)
- **Typography** — heading/body/display font families and sizes from the preset
- **Theme colors** — `--primary`, `--background`, `--foreground`, `--muted`, `--accent`, `--destructive`, `--border`, `--ring`, … in light + `.dark`
- **Radius** — `--radius` from the preset applied via `rounded-[var(--radius)]` in shadcn components
- All components generated under `src/components/ui/` with the preset's style

---

## Phase 1: Shadcn Foundation — Init with the Selected Preset 🏗️

**Priority:** CRITICAL | **Estimated Effort:** 1-2 hours

### Tasks
1. Run `npx shadcn@latest init --preset b7Br6guwa --template vite --yes` in `school-frontend`
2. Verify generated files: `components.json`, `src/lib/utils.js`, shadcn CSS variables in `src/index.css` (colors/radius/typography), tailwind config updates, dependency installs (`tailwindcss-animate`, `class-variance-authority`, `clsx`, `tailwind-merge`, `@radix-ui/*`)
3. Fold the SPEC2 Phase 5 theme into shadcn tokens — replace custom `--app-bg/--surface/--text-*` vars and the `html:not(.dark)` light-override layer with the preset's `:root` / `.dark` token blocks; keep `ThemeContext` `.dark` class toggling and the FOUC script
4. Install core components: `npx shadcn add button input label select textarea badge card dialog alert-dialog table pagination skeleton alert separator sonner dropdown-menu`

### Files to Modify
- `school-frontend/` — `components.json` (new), `src/lib/utils.js` (new), `tailwind.config.js`, `src/index.css`, `package.json`, `src/components/ui/*` (new)
- `school-frontend/index.html` (keep FOUC script)

### Verification
- [ ] `components.json` exists with preset config
- [ ] `src/components/ui/` contains the installed components
- [ ] Light/dark theme still toggles (tokens switch via `.dark` class)
- [ ] `npm test` + `npm run build` pass

### Phase Workflow
1. ⬜ Implement code changes
2. ⬜ Run `npm run build` + `npm test`
3. ⬜ Create `docs/phase1-shadcn-foundation.md`
4. ⬜ Update root `README.md` with Phase 1 summary
5. ⬜ Commit: `feat(phase1-spec3): shadcn foundation with selected preset`
6. ⬜ Push to `my-changes`

---

## Phase 2: Forms & Controls Migration 🎛️

**Priority:** HIGH | **Estimated Effort:** 3-4 hours

### Tasks
1. Replace `btn-primary` / `btn-secondary` / `btn-danger` with `Button` variants everywhere (pages + UI.jsx + ErrorBoundary)
2. Replace `.input` with `Input` / `Textarea` (all forms)
3. Replace `.label` + `Field` with `Label`
4. Replace raw `<select>` (Students status select, Users role select, Fees override select, UI.jsx Select) with shadcn `Select`
5. Remove `.btn-*`, `.input`, `.label`, `Field`, `Select` from `index.css` / `UI.jsx`

### Files to Modify
- All pages: `Login`, `Students`, `Teachers`, `Parents`, `Fees`, `Invoices`, `Payments`, `Users`
- `src/components/UI.jsx`, `src/components/ErrorBoundary.jsx`, `src/index.css`

### Verification
- [ ] No `btn-primary` / `btn-secondary` / `btn-danger` classes remain in `src/`
- [ ] No raw `<select>` remains
- [ ] Forms look consistent with preset styling
- [ ] `npm test` + `npm run build` pass

### Phase Workflow
1. ⬜ Implement code changes
2. ⬜ Run `npm test` + `npm run build`
3. ⬜ Create `docs/phase2-forms-controls.md`
4. ⬜ Update root `README.md` with Phase 2 summary
5. ⬜ Commit: `feat(phase2-spec3): shadcn forms and controls`
6. ⬜ Push to `my-changes`

---

## Phase 3: Data Display Migration 📊

**Priority:** HIGH | **Estimated Effort:** 3-4 hours

### Tasks
1. Replace `.card` with `Card` (+ `CardHeader`, `CardContent`, `CardTitle`, `CardDescription`)
2. Replace `Table` component with shadcn `Table` (`TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`); remove `.th` / `.td` / `.table-row` classes
3. Replace `StatusBadge` with `Badge` variants (map: active→success, withdrawn→secondary, graduated→secondary, pending→warning-ish, partial→warning, paid→success, overdue→destructive)
4. Replace `Pagination` with shadcn `Pagination`
5. Replace skeleton components with `Skeleton`
6. Replace `ErrorAlert` with `Alert`; `StatCard` + `EmptyState` + dashboard banners with `Card` / `Alert` composition

### Files to Modify
- `src/pages/Dashboard.jsx`, `Students.jsx`, `Teachers.jsx`, `Parents.jsx`, `Fees.jsx`, `Invoices.jsx`, `Payments.jsx`, `Users.jsx`
- `src/components/UI.jsx`, `src/components/LoadingSkeleton.jsx`, `src/index.css`

### Verification
- [ ] No `.card`, `.badge-*`, `.th` / `.td` / `.table-row` classes remain in `src/`
- [ ] Tables/badges/cards use shadcn components
- [ ] `npm test` + `npm run build` pass

### Phase Workflow
1. ⬜ Implement code changes
2. ⬜ Run `npm test` + `npm run build`
3. ⬜ Create `docs/phase3-data-display.md`
4. ⬜ Update root `README.md` with Phase 3 summary
5. ⬜ Commit: `feat(phase3-spec3): shadcn data display`
6. ⬜ Push to `my-changes`

---

## Phase 4: Overlays & Feedback Migration 🗔

**Priority:** HIGH | **Estimated Effort:** 2-3 hours

### Tasks
1. Replace `Modal` with `Dialog` (controlled via `open` / `onOpenChange`)
2. Replace `ConfirmModal` with `AlertDialog`
3. Migrate `react-hot-toast` → **sonner** (swap `Toaster` in `main.jsx`, `toast.success/error` imports in all pages)
4. Remove `react-hot-toast` from `package.json`
5. Re-style `ErrorBoundary` with `Button` / `Alert`

### Files to Modify
- `src/components/UI.jsx`, `src/main.jsx`
- All 8 pages (toast imports + modal usages)
- `src/components/ErrorBoundary.jsx`, `package.json`

### Verification
- [ ] No `Modal` / `ConfirmModal` imports remain
- [ ] No `react-hot-toast` references remain
- [ ] Toasts + dialogs + confirm dialogs work with preset styling
- [ ] `npm test` + `npm run build` pass

### Phase Workflow
1. ⬜ Implement code changes
2. ⬜ Run `npm test` + `npm run build`
3. ⬜ Create `docs/phase4-overlays-feedback.md`
4. ⬜ Update root `README.md` with Phase 4 summary
5. ⬜ Commit: `feat(phase4-spec3): shadcn overlays and feedback`
6. ⬜ Push to `my-changes`

---

## Phase 5: App Shell & Theme Polish 🎨

**Priority:** MEDIUM | **Estimated Effort:** 3-4 hours

### Tasks
1. Rebuild `App.jsx` sidebar / header / nav with shadcn components (`Button`, `Separator`, `DropdownMenu` for user menu, token colors for active states) — or adopt shadcn `Sidebar` if the preset includes it
2. Restyle `ThemeToggle` as `Button` `variant="ghost"` `size="icon"` with `Sun`/`Moon`
3. Apply preset **typography** — heading styles (font-display), body font, spacing
4. Ensure **colors + radius** from the preset are used everywhere (no stray hardcoded hex/rgb in pages; chart colors via tokens)
5. Delete remaining custom CSS from `index.css`; keep only `@tailwind` + shadcn tokens + `@layer base`

### Files to Modify
- `src/App.jsx`, `src/components/ThemeToggle.jsx`, `src/index.css`, `tailwind.config.js`
- `src/pages/Login.jsx` (shadcn `Card`)

### Verification
- [ ] Sidebar/header/nav use shadcn components + tokens
- [ ] Typography/colors/radius match the preset in light + dark
- [ ] No custom `@layer components` classes remain
- [ ] `npm test` + `npm run build` pass

### Phase Workflow
1. ⬜ Implement code changes
2. ⬜ Run `npm test` + `npm run build`
3. ⬜ Create `docs/phase5-app-shell.md`
4. ⬜ Update root `README.md` with Phase 5 summary
5. ⬜ Commit: `feat(phase5-spec3): shadcn app shell and theme polish`
6. ⬜ Push to `my-changes`

---

## Phase 6: Cleanup & Final Verification 🧹

**Priority:** MEDIUM | **Estimated Effort:** 2-3 hours

### Tasks
1. Delete `src/components/UI.jsx` (all primitives migrated) and `src/components/LoadingSkeleton.jsx`
2. Remove all dead custom CSS selectors + vars from `index.css`
3. Update tests — `App.test.jsx` (Login now uses shadcn `Card`/`Button`/`Input`), add a smoke test for a migrated component (e.g. `Dialog`/`Badge`)
4. Run `npm test`, `npm run build`, `npx eslint src`, and a browser pass (light + dark)
5. Verify no raw selectors remain: `grep -rn "btn-primary|badge-|\\.input|className=\"card"` must be empty

### Files to Modify
- `src/components/UI.jsx` (delete), `src/components/LoadingSkeleton.jsx` (delete)
- `src/index.css`, `src/__tests__/App.test.jsx` (+ new component test)
- `docs/*` + `README.md`

### Verification
- [ ] `UI.jsx` and `LoadingSkeleton.jsx` deleted
- [ ] Zero raw custom selectors in `src/`
- [ ] `npm test` (≥4), `npm run build`, `npx eslint src` pass
- [ ] Browser check: light + dark look consistent with the preset

### Phase Workflow
1. ⬜ Implement code changes
2. ⬜ Run tests + build + lint
3. ⬜ Create `docs/phase6-shadcn-cleanup.md`
4. ⬜ Update root `README.md` with Phase 6 summary
5. ⬜ Commit: `feat(phase6-spec3): shadcn cleanup and final verification`
6. ⬜ Push to `my-changes`

---

## 📊 Progress Tracking

| Phase | Status | Tests | Docs | Committed |
|-------|--------|-------|------|-----------|
| Phase 1: Shadcn Foundation | ✅ Complete | ✅ 4 passed | ✅ | ✅ |
| Phase 2: Forms & Controls | ✅ Complete | ✅ 4 passed | ✅ | ✅ |
| Phase 3: Data Display | ✅ Complete | ✅ 4 passed | ✅ | ✅ |
| Phase 4: Overlays & Feedback | ✅ Complete | ✅ 4 passed | ✅ | ✅ |
| Phase 5: App Shell & Theme Polish | ⏳ Pending | ⬜ | ⬜ | ⬜ |
| Phase 6: Cleanup & Final Verification | ⏳ Pending | ⬜ | ⬜ | ⬜ |

---

## 🔄 Workflow Summary

For each phase:
1. **Code** — Implement the changes
2. **Test** — Run `npm test` + `npm run build` (+ `npx eslint src` in Phase 6)
3. **Document** — Create phase documentation in `/docs`
4. **Update README** — Add phase summary to root README.md
5. **Commit** — Stage and commit with descriptive message
6. **Push** — Push to `my-changes` branch

---

## ⚠️ Key Risks

1. **Init rewrites config** — `shadcn init` replaces `index.css`/`tailwind.config.js`; the SPEC2 theme layer must be folded into the preset tokens in the same phase so dark/light still works.
2. **Select + controlled values** — Radix `Select` uses `onValueChange` (string), slightly different from native `<select>`; watch the Students/Users/Fees selects.
3. **Table row styling** — shadcn `Table` needs `hover:` styles re-added via `TableRow` className (token-based).
4. **Test updates** — queries in `App.test.jsx` target shadcn-rendered DOM; update selectors if needed.

---

*This spec is a living document. Update status as phases are completed.*
