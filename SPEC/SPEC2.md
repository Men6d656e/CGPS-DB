# 📋 SPEC2 — School Management System Reliability & Quality Plan

> **Created:** 2026-08-06 | **Branch:** `my-changes`
> **Purpose:** Phased improvement plan derived from PROJECT_OVERVIEW3.md deep codebase analysis
> **Workflow:** Each phase follows → Code → Test → Create Docs → Update README → Commit + Push

---

## 🎯 Overview

SPEC1 fixed the original critical issues, but an independent full-codebase review (`project-overview3.md`) exposed that the work was **incomplete or broken in places**: the dark-mode toggle is a visual no-op, the Users page crashes at runtime, both test suites cannot run, dashboard stats are broken by an enum case mismatch, and token revocation is dead code.

This spec outlines **6 phases** to make the project genuinely valid, reliable, and production-ready. All work happens on the `my-changes` branch.

---

## Phase 1: Critical Runtime Fixes 🔴

**Priority:** CRITICAL | **Estimated Effort:** 1-2 hours

### Tasks
1. **Fix Users page crash (TDZ bug)** — `useEffect` uses `user` before `const { user } = useAuth()` is declared; navigating to `/users` throws `ReferenceError` and crashes the app
2. **Fix enum case mismatch** — SQLAlchemy `SAEnum` persists enum *names* (`ACTIVE`, `PENDING`) while the API/frontend use lowercase (`active`, `pending`). Filtering by status and dashboard stat counts currently break (Postgres rejects `'active'` for enum column). Compare using enum members instead of raw strings
3. **Fix `get_monthly_collections` ordering** — currently returns the **oldest** N months (ASC + LIMIT); must return the **most recent** N months, sorted ascending for the chart

### Files to Modify
- `school-frontend/src/pages/Users.jsx`
- `school-backend/app/crud.py` (status filters + dashboard stats + monthly collections)

### Verification
- [ ] `/users` page renders without crashing (staff users see "Access Denied")
- [ ] `GET /students?status=active` and `GET /invoices?status=pending` return correct rows
- [ ] `GET /dashboard/stats` returns correct `active_students`, `pending_invoices`, `overdue_invoices`
- [ ] Dashboard chart shows the most recent 6 months (not the oldest)
- [ ] Frontend builds and backend imports cleanly

### Phase Workflow
1. ⬜ Implement code changes
2. ⬜ Run `npm run build` (frontend) + backend import/syntax check
3. ⬜ Create `docs/phase1-critical-runtime-fixes.md`
4. ⬜ Update root `README.md` with Phase 1 summary
5. ⬜ Commit: `fix(phase1-spec2): critical runtime fixes`
6. ⬜ Push to `my-changes`

---

## Phase 2: Restore Broken Testing Infrastructure 🧪

**Priority:** CRITICAL | **Estimated Effort:** 2-3 hours

### Tasks
1. **Rewrite backend tests** — `tests/conftest.py` and `tests/test_auth.py` are syntactically broken (contain escaped-quote `\"` sequences → `SyntaxError` on line 1). Rewrite them cleanly and keep existing coverage
2. **Add `pytest` to `requirements.txt`** — it's missing from the venv, so even fixed tests can't run
3. **Fix frontend test** — `App.test.jsx` uses `vi.mock(...)` without importing `vi` → `ReferenceError: vi is not defined`
4. **Add vitest test config** — `test` block in `vite.config.js` so tests run deterministically

### Files to Modify
- `school-backend/tests/conftest.py` (rewrite)
- `school-backend/tests/test_auth.py` (rewrite)
- `school-backend/requirements.txt`
- `school-frontend/src/__tests__/App.test.jsx`
- `school-frontend/vite.config.js`

### Verification
- [ ] `pytest tests/` passes in `school-backend`
- [ ] `npm test` passes in `school-frontend`
- [ ] Tests are real (not skipped/empty)

### Phase Workflow
1. ⬜ Implement code changes
2. ⬜ Run `pytest` for backend tests
3. ⬜ Run `npm test` for frontend tests
4. ⬜ Create `docs/phase2-restore-testing.md`
5. ⬜ Update root `README.md` with Phase 2 summary
6. ⬜ Commit: `fix(phase2-spec2): restore broken test suites`
7. ⬜ Push to `my-changes`

---

## Phase 3: Security Hardening 🔐

**Priority:** HIGH | **Estimated Effort:** 2-3 hours

### Tasks
1. **Fix JWT revocation (dead code)** — tokens are created *without* a `jti` claim, so the DB revocation list is never consulted and logged-out refresh tokens stay valid. Add `jti` (uuid) to access + refresh tokens; enforce revocation checks on refresh
2. **Keyed HMAC dedup hashes** — CNIC/B-Form hashes currently use unsalted SHA-256, which is brute-forceable for a 13-digit space. Switch to HMAC-SHA256 keyed with `SECRET_KEY` (or a new `HASH_SECRET_KEY`); provide a re-hash data script for existing rows (decrypt with RSA → re-hash)

### Files to Modify
- `school-backend/app/auth.py` (jti in token creators, revocation)
- `school-backend/app/encryption.py` (HMAC-based `hash_for_dedup`)
- `school-backend/app/config.py` (`HASH_SECRET_KEY` setting)
- `school-backend/scripts/rehash_dedup_hashes.py` (new data script)

### Verification
- [ ] Tokens contain a unique `jti` claim
- [ ] Logout invalidates the refresh token (refresh with revoked token returns 401)
- [ ] `hash_for_dedup` output is HMAC-keyed (not plain SHA-256)
- [ ] Existing rows can be re-hashed via script (documented, not auto-run)

### Phase Workflow
1. ⬜ Implement code changes
2. ⬜ Run `pytest` for backend tests
3. ⬜ Run `npm test` for frontend tests
4. ⬜ Create `docs/phase3-security-hardening.md`
5. ⬜ Update root `README.md` with Phase 3 summary
6. ⬜ Commit: `fix(phase3-spec2): security hardening`
7. ⬜ Push to `my-changes`

---

## Phase 4: Data Integrity & Indexes 🗄️

**Priority:** HIGH | **Estimated Effort:** 2-3 hours

### Tasks
1. **Add missing database indexes** — `invoices.billing_month`, `payments.invoice_id`, `invoices.student_id`, `invoices.status` (Postgres does not auto-index FKs)
2. **Payment soft-void** — replace hard `DELETE` with `is_voided` flag so financial history is never destroyed; exclude voided payments from totals; recalculate invoice status on void
3. **Protect paid invoices** — block deleting an invoice that has payments
4. **Auto-detect overdue** — treat invoices past `due_date` with unpaid balance as overdue on read (no manual-only button)

### Files to Modify
- `school-backend/app/models.py` (Payment.is_voided)
- `school-backend/app/crud.py` (financials, void logic, overdue logic)
- `school-backend/app/routers.py` (payment delete → void endpoint semantics)
- `school-backend/alembic/versions/` (new migration: indexes + is_voided column)

### Verification
- [ ] Indexes exist in migration
- [ ] Voiding a payment keeps the row but excludes it from totals
- [ ] Invoice with payments cannot be deleted
- [ ] Overdue status computed from `due_date` on read
- [ ] `pytest` + `npm test` pass

### Phase Workflow
1. ⬜ Implement code changes
2. ⬜ Run Alembic migration (dev DB)
3. ⬜ Run `pytest` for backend tests
4. ⬜ Run `npm test` for frontend tests
5. ⬜ Create `docs/phase4-data-integrity.md`
6. ⬜ Update root `README.md` with Phase 4 summary
7. ⬜ Commit: `feat(phase4-spec2): data integrity and indexes`
8. ⬜ Push to `my-changes`

---

## Phase 5: Working Dark / Light Theme 🎨

**Priority:** MEDIUM | **Estimated Effort:** 3-4 hours

### Tasks
1. **Enable class-based dark mode** — add `darkMode: 'class'` to `tailwind.config.js` (currently defaults to `media`, so the toggled class does nothing)
2. **CSS-variable palette** — define semantic tokens (`--background`, `--foreground`, `--border`, etc.) with `.dark` overrides in `index.css` (shadcn-style) and refactor the shared component classes (`.card`, `.btn-*`, `.input`, `.badge-*`, body) to use them
3. **Refactor app shell + Login + Toaster** to use the variables
4. **Remove hardcoded `class="dark"`** from `index.html` so the stored preference wins

### Files to Modify
- `school-frontend/tailwind.config.js`
- `school-frontend/src/index.css`
- `school-frontend/index.html`
- `school-frontend/src/main.jsx` (Toaster colors)
- `school-frontend/src/App.jsx`, `school-frontend/src/pages/Login.jsx`
- `school-frontend/src/contexts/ThemeContext.jsx` (if needed)

### Verification
- [ ] Theme toggle actually changes light/dark appearance
- [ ] Preference persists in `localStorage`
- [ ] No flash of wrong theme on load
- [ ] `npm test` + `npm run build` pass

### Phase Workflow
1. ⬜ Implement code changes
2. ⬜ Run `npm run build` (frontend)
3. ⬜ Run `npm test` for frontend tests
4. ⬜ Create `docs/phase5-working-theme.md`
5. ⬜ Update root `README.md` with Phase 5 summary
6. ⬜ Commit: `feat(phase5-spec2): working dark and light theme`
7. ⬜ Push to `my-changes`

---

## Phase 6: Code Quality & Performance 🚀

**Priority:** MEDIUM | **Estimated Effort:** 3-4 hours

### Tasks
1. **Add ESLint + Prettier** configs and lint the codebase
2. **Add GitHub Actions CI** — run backend pytest + frontend tests + build on push
3. **Code splitting** — lazy-load pages with `React.lazy` (bundle is 682 kB; chunk-size warning)
4. **Modal accessibility** — Escape-to-close, scroll lock, focus trap, `aria-*` in `UI.jsx`
5. **Search debounce** — Students/Teachers/Parents/Invoices searches
6. **Cleanup** — delete `school-backend/cookies.txt`, add missing `favicon.svg`, de-duplicate the two `Limiter` instances (`main.py` + `routers.py`)

### Files to Modify
- `.eslintrc` / `.prettierrc` (new), `.github/workflows/ci.yml` (new)
- `school-frontend/src/App.jsx` (lazy routes)
- `school-frontend/src/components/UI.jsx` (a11y)
- `school-frontend/src/pages/*.jsx` (debounce)
- `school-backend/app/main.py`, `school-backend/app/routers.py`
- `school-frontend/public/favicon.svg` (new)

### Verification
- [ ] `npx eslint .` passes
- [ ] CI workflow file present
- [ ] Bundle split into per-page chunks
- [ ] Modals close on Escape, lock body scroll
- [ ] `pytest` + `npm test` pass

### Phase Workflow
1. ⬜ Implement code changes
2. ⬜ Run lint + build + tests
3. ⬜ Create `docs/phase6-code-quality.md`
4. ⬜ Update root `README.md` with Phase 6 summary
5. ⬜ Commit: `feat(phase6-spec2): code quality and performance`
6. ⬜ Push to `my-changes`

---

## 📊 Progress Tracking

| Phase | Status | Tests | Docs | Committed |
|-------|--------|-------|------|-----------|
| Phase 1: Critical Runtime Fixes | ✅ Complete | ✅ | ✅ | ✅ |
| Phase 2: Restore Testing | ✅ Complete | ✅ | ✅ | ✅ |
| Phase 3: Security Hardening | ✅ Complete | ✅ | ✅ | ✅ |
| Phase 4: Data Integrity & Indexes | ⏳ Pending | ⬜ | ⬜ | ⬜ |
| Phase 5: Working Theme | ⏳ Pending | ⬜ | ⬜ | ⬜ |
| Phase 6: Code Quality & Performance | ⏳ Pending | ⬜ | ⬜ | ⬜ |

---

## 🔄 Workflow Summary

For each phase:
1. **Code** — Implement the changes
2. **Test** — Run backend (pytest) and frontend (npm test) tests
3. **Document** — Create phase documentation in `/docs`
4. **Update README** — Add phase summary to root README.md
5. **Commit** — Stage and commit with descriptive message
6. **Push** — Push to `my-changes` branch

---

*This spec is a living document. Update status as phases are completed.*
