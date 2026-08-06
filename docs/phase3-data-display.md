# Phase 3 (SPEC3) — Data Display Migration 📊

> **Date:** 2026-08-06 | **Branch:** `my-changes`
> **Commit:** `feat(phase3-spec3): shadcn data display`

## What was done

Replaced all hand-rolled data-display components with shadcn/ui equivalents.

### Table — `.table-row` / `.th` / `.td` / raw `<table>` → shadcn `Table`
- `UI.jsx` `Table` wrapper now renders the shadcn `Table` primitives
  (`TableHeader` / `TableBody` / `TableHead` / `TableRow`) and keeps the
  `headers` + `empty` API, so pages change only their row markup.
- Every table body in **Students, Teachers, Parents, Invoices, Payments, Users**
  now uses `<TableRow>` / `<TableCell>` (token-based hover states, no custom classes).

### Badges — `.badge-*` → `Badge`
- Exported `STATUS_STYLES` (semantic badge colors) from `UI.jsx`:
  active/paid → emerald, pending/partial → amber/orange, overdue → red,
  withdrawn/inactive → slate, graduated → sky — each with `dark:` variants.
- `StatusBadge` now renders a shadcn `Badge` using the map (Invoices).
- Inline badges in Students (status), Teachers (status), Fees (active/inactive,
  including the click-to-toggle badge), Users (active/inactive) → `Badge`.

### Pagination → shadcn `Pagination`
- `UI.jsx` `Pagination` now uses `PaginationPrevious` / `PaginationNext`
  (API unchanged: `skip` / `limit` / `totalItemsInCurrentPage` / `onNext` / `onPrev`).

### Cards — `.card` → `Card`
- `StatCard` (Dashboard) → `Card` + `CardContent` with colored icon chips.
- Dashboard: pending-amount banner, "Collections Overview" chart card,
  "Recent Invoices" card → `Card` + `CardHeader`/`CardTitle`/`CardDescription`;
  chart bars now colored via `--chart-1` / `--chart-3` CSS variables (preset tokens).
- Invoices summary cards, Payments total-collected card, Fees expandable rows → `Card`.
- `Modal` container now uses token classes (`bg-card border-border`) instead of `.card`.

### Skeleton → shadcn `Skeleton`
- `LoadingSkeleton.jsx` (`TableSkeleton`, `CardSkeleton`, `StatCardSkeleton`,
  `ChartSkeleton`, `FormSkeleton`) rewritten with the shadcn `Skeleton` primitive.

### Other
- `ErrorAlert` → shadcn `Alert variant="destructive"`.
- `EmptyState` → token-based (inside the table card with a top border).
- Removed the final custom CSS layer from `index.css`: `.card`, `.badge`,
  `.badge-*`, `.table-row`, `.th`, `.td` and their `html:not(.dark)` overrides.
- Dashboard's recharts tooltip → token-styled (`bg-popover`).

## Verification

| Check | Result |
|---|---|
| `grep "card\|badge-\|table-row\|className=\"td\|className=\"th\|btn-\|className=\"input\|className=\"label"` in `src/` | ✅ 0 matches |
| `npx vite build` | ✅ built |
| `npx vitest run` | ✅ 4 passed (2 files) |
| `npx eslint src` | ✅ 0 errors (5 pre-existing `exhaustive-deps` warnings) |

## Files

- **Migrated:** `src/pages/{Dashboard,Students,Teachers,Parents,Fees,Invoices,Payments,Users}.jsx`
- **Modified:** `src/components/UI.jsx`, `src/components/LoadingSkeleton.jsx`,
  `src/components/ui/badge.jsx` (removed unused React import), `src/index.css`

## Notes for later phases

- `Modal`, `ConfirmModal` still custom (they render a token-styled panel now) —
  Phase 4 replaces them with `Dialog` / `AlertDialog`.
- `react-hot-toast` → sonner in Phase 4; `App.jsx` shell + typography polish in Phase 5.
