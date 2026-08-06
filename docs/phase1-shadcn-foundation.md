# Phase 1 (SPEC3) — Shadcn Foundation with the Selected Preset 🏗️

> **Date:** 2026-08-06 | **Branch:** `my-changes`
> **Commit:** `feat(phase1-spec3): shadcn foundation with selected preset`

## What was done

The frontend had **zero shadcn infrastructure**. This phase bootstrapped the full
shadcn/ui stack (the equivalent of `npx shadcn@latest init --preset b7Br6guwa
--template vite`) into the JS/Vite project and folded the SPEC2 custom theme into
shadcn's standard token system.

### 1. Deterministic shadcn init (JS/Vite)
The interactive `shadcn init` CLI was unreliable over a pipe (clack select prompts),
so the init was reproduced deterministically:

- **`components.json`** — `new-york` style, `neutral` base color, CSS variables,
  `tsx: false` (JavaScript), lucide icons, `@/` alias.
- **`jsconfig.json`** — lets the CLI/editor resolve `@/* → ./src/*` in a JS project.
- **`src/lib/utils.js`** — the `cn()` helper (`clsx` + `tailwind-merge`).
- **`vite.config.js`** — added `resolve.alias` for `@` → `./src`.

### 2. Installed components (`src/components/ui/`, 17 total)
`button`, `badge`, `card`, `dialog`, `alert-dialog`, `select`, `input`, `label`,
`textarea`, `table`, `pagination`, `skeleton`, `alert`, `separator`, `dropdown-menu`,
`sonner`, `tooltip`, `switch` — all generated as **`.jsx`** wired to Radix primitives
(`@radix-ui/react-dialog`, `react-select`, `react-dropdown-menu`, …).

### 3. Theme tokens (preset colors + radius + dark mode)
- **`src/index.css`** — added the shadcn neutral token blocks: light values on `:root`,
  dark values on `.dark` (background, foreground, card, popover, primary, secondary,
  muted, accent, destructive, border, input, ring, `--radius: 0.5rem`, chart colors).
- **`tailwind.config.js`** — mapped `colors.border/input/ring/background/foreground/
  primary/secondary/destructive/muted/accent/popover/card` to the CSS variables,
  added `borderRadius.lg/md/sm` from `--radius`, registered the **`tailwindcss-animate`**
  plugin (needed for the `animate-in`/`zoom-in`/`slide-in-from-*` utilities the
  components use), and added the accordion keyframes.
- ThemeContext (`.dark` class toggle) and the FOUC script in `index.html` are unchanged —
  shadcn components now follow the same light/dark switch automatically.
- `sonner.jsx` was rewired to use the project's **ThemeContext** (the generated code
  imported `next-themes`, which isn't used here).

### 4. Fixed the broken dependency tree 🩹
Plain `npm install` (no flags) **never worked** in this project — cascading peer
conflicts forced `--legacy-peer-deps` everywhere:

| Package | Before | After | Why |
|---|---|---|---|
| `vite` | `^8.0.14` | `^7.3.6` | `@vitejs/plugin-react` 4.x only supports vite ≤7 |
| `@vitejs/plugin-react` | `^4.3.0` (4.7) | `^4.7.0` | 5.x broke the automatic JSX runtime under vitest ("React is not defined") |
| `eslint` | `^10.8.0` | `^9.39.5` | `eslint-plugin-react` 7.x caps at eslint 9.7 |
| `@eslint/js` | `^10.0.1` | `^9.39.5` | matches eslint 9 |

`npm install --dry-run` now resolves **cleanly with zero ERESOLVE errors**.

## Verification

| Check | Result |
|---|---|
| `npx vite build` | ✅ built in ~7s |
| `npx vitest run` | ✅ 4 passed (2 files) |
| `npx eslint src/components/ui src/lib` | ✅ 0 errors |
| `npm install --dry-run` (no flags) | ✅ clean — no peer conflicts |

## Files

- **New:** `components.json`, `jsconfig.json`, `src/lib/utils.js`, `src/components/ui/*` (17 files)
- **Modified:** `vite.config.js`, `tailwind.config.js`, `src/index.css`, `src/components/ui/sonner.jsx`, `package.json`, `package-lock.json`

## Notes for later phases

- The SPEC2 custom CSS (`.btn-*`, `.input`, `.card`, `.badge-*`, `.th/.td`, light-override
  layer) is **still present on purpose** — it keeps pages looking right while they migrate
  phase-by-phase. Phases 2–6 remove it.
- `npm install` no longer needs `--legacy-peer-deps`; plain `npm install` works.
