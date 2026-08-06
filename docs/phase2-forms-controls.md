# Phase 2 (SPEC3) — Forms & Controls Migration 🎛️

> **Date:** 2026-08-06 | **Branch:** `my-changes`
> **Commit:** `feat(phase2-spec3): shadcn forms and controls`

## What was done

Replaced every hand-rolled form control across all 8 pages + shared components
with shadcn/ui components.

### Buttons — `btn-primary` / `btn-secondary` / `btn-danger` → `Button`
- Primary actions (`Add Student`, `Create Invoice`, `Sign In`, …) → `<Button>` (`default` variant)
- Cancel buttons → `<Button variant="outline">`
- Destructive confirms → `<Button variant="destructive">`
- Table row actions (view / edit / link / print / delete) → `<Button variant="ghost" size="icon">`
- Login "show password" toggle → ghost icon button

### Inputs — `.input` → `Input` / `Textarea`
- ~60 raw `<input className="input">` → `<Input>` (text, email, number, date, month, password)
- 6 raw `<textarea className="input">` → `<Textarea>` (Teacher address, Parent address)

### Labels — `.label` → `Label` / `Field` rewrite
- Raw `<label className="label">` → `<Label>` (Login, Invoices "Fee Items")
- `Field` in `UI.jsx` now renders a shadcn `Label` internally (same API for pages)
- Detail-modal section headings (`className="label mb-2"`) → `text-muted-foreground` paragraphs

### Selects — raw `<select>` / UI `Select` → shadcn `Select` (Radix)
- **`UI.jsx` `Select` component deleted** — every usage migrated to the real shadcn `Select`
  (`SelectTrigger` / `SelectValue` / `SelectContent` / `SelectItem`), using Radix's
  `onValueChange` API
- Migrated: status filters (Students/Teachers/Invoices), student status quick-edit
  (table cell), current-class selects, teacher status, user role, fee class override,
  invoice student picker, payment invoice picker, link-parent pickers
- Empty/"All" options use a sentinel value (`all` / `none`) mapped back to `''` in state

### Checkboxes → `Switch`
- Fees edit modal `is_active` checkbox → `<Switch>`
- Invoices create modal line-item checkboxes → `<Switch>`

### Other
- `ConfirmModal` + `Pagination` (in `UI.jsx`) buttons → shadcn `Button`
- `ErrorBoundary` retry button → shadcn `Button`
- Login page fully rebuilt with shadcn `Card` / `CardContent` / `Alert` (destructive)
- Dead CSS removed from `index.css`: `.btn-primary`, `.btn-secondary`, `.btn-danger`,
  `.input`, `.label`, `.card-hover` + their light-override rules
- **Lint fix:** enabled `react/jsx-uses-vars` — the config was missing it, so
  `no-unused-vars` flagged every JSX-referenced identifier (237 false warnings
  collapsed to 6 pre-existing `exhaustive-deps` notices)

## Verification

| Check | Result |
|---|---|
| `grep btn-primary/btn-secondary/btn-danger src` | ✅ 0 matches |
| `grep <select src` | ✅ 0 matches |
| `grep 'className="input"' src` | ✅ 0 matches |
| `npx vite build` | ✅ built |
| `npx vitest run` | ✅ 4 passed (2 files) |
| `npx eslint src` | ✅ 0 errors (6 pre-existing warnings) |

## Files

- **Migrated:** `src/pages/{Login,Students,Teachers,Parents,Fees,Invoices,Payments,Users}.jsx`
- **Modified:** `src/components/UI.jsx`, `src/components/ErrorBoundary.jsx`,
  `src/index.css`, `eslint.config.js`

## Notes for later phases

- Custom `.card`, `.badge-*`, `.table-row`, `.th/.td` classes remain — Phase 3
  (data display) replaces them with `Card`, `Badge`, `Table`, `Pagination`, `Skeleton`.
- `react-hot-toast`, `Modal`, `ConfirmModal`, `StatusBadge`, `StatCard`,
  `EmptyState`, `ErrorAlert` remain — Phase 4 (overlays & feedback).
