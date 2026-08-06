# 📋 Phase 2: Restore Broken Testing Infrastructure (SPEC2)

> **Completed:** 2026-08-06 | **Branch:** `my-changes`
> **Spec:** [SPEC/SPEC2.md](../SPEC/SPEC2.md)

---

## 🎯 Overview

Phase 2 of SPEC2 fixes the fact that **neither test suite could run**:

- `school-backend/tests/conftest.py` and `tests/test_auth.py` contained literal escaped-quote sequences (`\"`) — a `SyntaxError` on line 1, so pytest could never collect them (and `pytest` wasn't even in `requirements.txt`/the venv).
- `school-frontend/src/__tests__/App.test.jsx` used `vi.mock(...)` without importing `vi` → `ReferenceError: vi is not defined`.
- No vitest config existed (no jsdom environment, no jest-dom setup).

---

## ✅ Changes Made

### 1. Rewrote Backend Test Files

**Files:** `school-backend/tests/conftest.py`, `school-backend/tests/test_auth.py`

Both were rewritten cleanly from the escaped-quote garbage:

- **`conftest.py`** — async `client` fixture (via `ASGITransport`, works with `pytest-asyncio` auto mode) + the sample-data fixtures (`sample_user_data`, `sample_student_data`, `sample_parent_data`, `sample_teacher_data`, `sample_fee_type_data`). Removed the custom `event_loop` fixture (deprecated under modern pytest-asyncio).
- **`test_auth.py`** — password hashing, JWT creation/decoding, expiration, and role enum tests. `decode_token()` is **async**, so decode tests are now `async def` and properly `await`ed (the old file called it synchronously, which would have crashed on `payload["sub"]`).

### 2. Added Test Dependencies

**File:** `school-backend/requirements.txt`

```text
# Testing (see pytest.ini — asyncio_mode=auto)
pytest==8.2.2
pytest-asyncio==0.23.8
```

Installed into the venv: `pip install pytest==8.2.2 pytest-asyncio==0.23.8`

### 3. Fixed Frontend Test

**File:** `school-frontend/src/__tests__/App.test.jsx`

- Added the missing `vi` import
- Replaced ambiguous text queries with robust ones (`getByRole('heading')`, `getByRole('button')`) — the old `getByText(/School Management/i)` matched *two* elements (heading + footer) and would have thrown even after the `vi` fix

### 4. Vitest Configuration

**File:** `school-frontend/vite.config.js` + new `src/__tests__/setup.js`

```js
test: {
  environment: 'jsdom',          // needs jsdom (added to devDependencies)
  globals: true,
  setupFiles: './src/__tests__/setup.js',  // registers jest-dom matchers
}
```

Installed: `npm install -D jsdom --legacy-peer-deps` (project convention from README).

---

## 🧪 Testing (verified by execution)

### Backend
```bash
cd school-backend && .venv/bin/python -m pytest -q
# → 11 passed, 7 warnings in 2.15s
```

### Frontend
```bash
cd school-frontend && npx vitest run
# → Test Files 1 passed (1) | Tests 2 passed (2)
```

---

## 📚 Documentation

- Created `docs/phase2-restore-testing.md` (this file)
- Updated `README.md` — SPEC2 Phase 2 status → Complete
- Updated `SPEC/SPEC2.md` progress table

---

## 📊 Phase Status

| Task | Status |
|------|--------|
| Rewrite `conftest.py` (SyntaxError fixed) | ✅ Completed |
| Rewrite `test_auth.py` (correct async handling) | ✅ Completed |
| Add `pytest` + `pytest-asyncio` to requirements | ✅ Completed |
| Fix `App.test.jsx` (`vi` import, robust queries) | ✅ Completed |
| Vitest config (jsdom + jest-dom setup) | ✅ Completed |
| Backend `pytest` passes | ✅ 11 passed |
| Frontend `npm test` passes | ✅ 2 passed |

---

## 🔄 Git Workflow

```bash
git add school-backend/tests/ school-backend/requirements.txt
git add school-frontend/src/__tests__/ school-frontend/vite.config.js
git add school-frontend/package.json school-frontend/package-lock.json
git add docs/phase2-restore-testing.md README.md SPEC/SPEC2.md
git commit -m 'fix(phase2-spec2): restore broken test suites'
git push origin my-changes
```

---

## ⚠️ Notes

1. **No skipped/empty tests** — all 11 backend + 2 frontend tests are real assertions.
2. **Warnings** are pre-existing library deprecations (passlib `crypt`, python-jose `utcnow`) — harmless, not caused by this phase.
3. From here on, every SPEC2 phase can actually verify with `pytest` + `npm test`.

---

*Next Phase: [Phase 3: Security Hardening](phase3-security-hardening.md)*
