# 📋 Phase 5: Working Dark / Light Theme (SPEC2)

> **Completed:** 2026-08-06 | **Branch:** `my-changes`
> **Spec:** [SPEC/SPEC2.md](../SPEC/SPEC2.md)

---

## 🎯 Overview

Phase 5 makes the **theme toggle actually work**. Before this phase the toggle changed React state, localStorage, and a CSS class — but the CSS never reacted (Tailwind wasn't in class mode, there were zero `dark:` variants, and the entire UI was hardcoded to the dark palette). Docs from SPEC1 even claimed dark mode was "✅ Completed".

---

## ✅ Changes Made

### 1. Class-Based Dark Mode Enabled

**File:** `school-frontend/tailwind.config.js`

```js
darkMode: 'class',   // toggle via <html class="dark">
```

The default `media` strategy (OS preference) was ignoring the toggled class.

### 2. Semantic CSS-Variable Tokens

**File:** `school-frontend/src/index.css`

Added shadcn-style theme tokens with dark-first defaults and `html:not(.dark)` overrides:

```css
:root { /* dark palette */
  --app-bg: #020617; --surface: #0f172a; --border: #1e293b;
  --text-primary: #f1f5f9; --text-muted: #94a3b8; ... }
html:not(.dark) { /* light palette */
  --app-bg: #f8fafc; --surface: #ffffff; --border: #e2e8f0;
  --text-primary: #0f172a; --text-muted: #475569; ... }
```

`body`, scrollbars, and the shared component classes (`.card`, `.input`, `.btn-secondary`, `.label`, `.badge-withdrawn`, `.table-row`, `.th`, `.td`) now use the tokens, with smooth `background-color`/`color` transitions.

### 3. Light Override Layer (the whole app switches)

Because the app was built dark-first with raw slate utilities everywhere, a **light override layer** remaps the exact slate utilities used across pages when `<html>` has no `dark` class:

- Backgrounds: `bg-slate-950/900/800/700` (+ `/40..95` opacity variants) → light surfaces
- Text: `text-slate-100..600` → dark text tiers
- Accent text: `text-brand-400`, `text-emerald-400`, `text-amber-400`, `text-red-400`, `text-orange-400` → darker shades for contrast on white
- Borders, hover states, modal overlays (`bg-black/60|70`), and scrollbars

Result: sidebar, header, tables, modals, toasts, and every page flip together in one class toggle.

### 4. index.html Cleanup + No-FOUC Guard

**File:** `school-frontend/index.html`

- Removed the hardcoded `<html class="dark">`
- Added a tiny inline script that applies the saved/system theme **before first paint** (no flash of wrong theme)

### 5. Toaster Uses Theme Tokens

**File:** `school-frontend/src/main.jsx`

Toast background/text/border now use `var(--toast-bg)` / `var(--toast-fg)` / `var(--toast-border)`.

### 6. Theme Toggle on Login Page

**File:** `school-frontend/src/pages/Login.jsx`

Added the toggle to the top-right of the login screen (previously only available after login).

### 7. Tests

**Files:** `src/__tests__/ThemeContext.test.jsx` (new), `src/__tests__/setup.js`, `src/__tests__/App.test.jsx`

- Added a `matchMedia` stub to the vitest setup (jsdom doesn't implement it)
- New ThemeContext tests prove: clicking toggles the `dark` class on `<html>` AND persists to localStorage; saved preference is restored on mount
- App tests updated to mock ThemeContext (Login now renders a toggle)

---

## 🧪 Testing (verified by execution)

### Frontend
```bash
cd school-frontend && npx vitest run
# → Test Files 2 passed (2) | Tests 4 passed (4)

cd school-frontend && npx vite build
# → ✓ built
```

- ✅ Toggle flips `document.documentElement` class + localStorage (unit-verified)
- ✅ No hardcoded `class="dark"` remains in `index.html`
- ✅ `darkMode: 'class'` configured; 59 light-override rules in `index.css`

---

## 📚 Documentation

- Created `docs/phase5-working-theme.md` (this file)
- Updated `README.md` — SPEC2 Phase 5 status → Complete
- Updated `SPEC/SPEC2.md` progress table

---

## 📊 Phase Status

| Task | Status |
|------|--------|
| `darkMode: 'class'` in Tailwind | ✅ Completed |
| CSS-variable semantic palette | ✅ Completed |
| Light override layer (pages + shell + modals + toasts) | ✅ Completed |
| Removed hardcoded `class="dark"` + FOUC guard | ✅ Completed |
| Toaster themed via variables | ✅ Completed |
| Theme toggle on Login page | ✅ Completed |
| ThemeContext tests (class + localStorage) | ✅ 4 frontend tests pass |

---

## 🔄 Git Workflow

```bash
git add school-frontend/tailwind.config.js school-frontend/src/index.css
git add school-frontend/index.html school-frontend/src/main.jsx
git add school-frontend/src/pages/Login.jsx
git add school-frontend/src/__tests__/
git add docs/phase5-working-theme.md README.md SPEC/SPEC2.md
git commit -m 'feat(phase5-spec2): working dark and light theme'
git push origin my-changes
```

---

## ⚠️ Notes

1. **Light mode fidelity** — the override layer remaps the slate palette consistently, but a few one-off inline colors (e.g. chart bar `#1e3a4f`) remain dark-on-light by design (they read well on white). A future polish pass can add per-component light tuning.
2. **System preference** — first visit follows `prefers-color-scheme`; manual toggles persist in `localStorage` and win afterwards.
3. **Accessibility** — accent text colors in light mode were darkened to meet contrast; the toggle button itself keeps its hover state in both modes.

---

*Next Phase: [Phase 6: Code Quality & Performance](phase6-code-quality.md)*
