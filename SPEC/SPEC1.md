# 📋 SPEC1 — School Management System Improvement Plan

> **Created:** 2026-08-05 | **Branch:** `my-changes`
> **Purpose:** Phased improvement plan derived from PROJECT_OVERVIEW2.md analysis
> **Workflow:** Each phase follows → Code → Test → Create Docs → Update README → Commit + Push

---

## 🎯 Overview

This spec outlines 6 phases to fix critical issues, add missing features, and improve the School Fee Management System. All work happens on the `my-changes` branch.

---

## Phase 1: Critical Security & Core Fixes 🔴

**Priority:** CRITICAL | **Estimated Effort:** 2-3 hours

### Tasks
1. **Remove hardcoded credentials** from `AuthContext.jsx` and `Login.jsx`
2. **Fix bcrypt compatibility** — Pin `bcrypt==4.0.1` in requirements.txt
3. **Replace in-memory token revocation** with database-backed solution
4. **Create seed script** for first admin user

### Files to Modify
- `school-frontend/src/contexts/AuthContext.jsx`
- `school-frontend/src/pages/Login.jsx`
- `school-backend/requirements.txt`
- `school-backend/app/auth.py`
- `school-backend/scripts/seed_admin.py` (new)

### Verification
- [ ] Login works without hardcoded credentials
- [ ] Token revocation persists across server restarts
- [ ] Admin user can be created via seed script

### Phase Workflow
1. ✅ Implement code changes
2. ✅ Run `pytest` for backend tests
3. ✅ Run `npm test` for frontend tests
4. ✅ Create `docs/phase1-security-fixes.md`
5. ✅ Update root `README.md` with Phase 1 summary
6. ✅ Commit: `feat(phase1): critical security and core fixes`
7. ✅ Push to `my-changes`

---

## Phase 2: User Management System 👥

**Priority:** HIGH | **Estimated Effort:** 3-4 hours

### Tasks
1. **Add `role` column** to User model + Alembic migration
2. **Create backend `/api/v1/users` router** with:
   - `GET /users` — List all users (admin only)
   - `POST /users` — Create new user (admin only)
   - `PATCH /users/{id}/role` — Update user role (admin only)
   - `PATCH /users/{id}/password` — Reset password (admin only)
3. **Add frontend route** for `/users` in `App.jsx`
4. **Implement RBAC middleware** for admin-only endpoints

### Files to Modify
- `school-backend/app/models.py`
- `school-backend/alembic/versions/add_role_to_users.py` (new)
- `school-backend/app/routers.py`
- `school-backend/app/schemas.py`
- `school-backend/app/crud.py`
- `school-frontend/src/App.jsx`
- `school-backend/app/auth.py` (RBAC dependency)

### Verification
- [ ] User model has `role` column (admin/staff)
- [ ] `/api/v1/users` endpoints work
- [ ] Frontend Users page accessible at `/users`
- [ ] Non-admin users cannot access user management

### Phase Workflow
1. ✅ Implement code changes
2. ✅ Run Alembic migration
3. ✅ Run `pytest` for backend tests
4. ✅ Run `npm test` for frontend tests
5. ✅ Create `docs/phase2-user-management.md`
6. ✅ Update root `README.md` with Phase 2 summary
7. ✅ Commit: `feat(phase2): complete user management system`
8. ✅ Push to `my-changes`

---

## Phase 3: Dashboard Improvements 📊

**Priority:** MEDIUM | **Estimated Effort:** 2-3 hours

### Tasks
1. **Compute trend percentages** from actual data (not hardcoded)
2. **Replace synthetic chart data** with real metrics
3. **Fix "View All" button** — Navigate to invoices page
4. **Fix "Projects" label** — Change to "Recent Invoices"
5. **Compute progress bars** from actual data

### Files to Modify
- `school-frontend/src/pages/Dashboard.jsx`
- `school-backend/app/crud.py` (dashboard stats endpoint)

### Verification
- [ ] Trend percentages reflect actual changes
- [ ] Charts show real data (not scaled copies)
- [ ] "View All" navigates to `/invoices`
- [ ] Label says "Recent Invoices"
- [ ] Progress bars show real percentages

### Phase Workflow
1. ✅ Implement code changes
2. ✅ Run `pytest` for backend tests
3. ✅ Run `npm test` for frontend tests
4. ✅ Create `docs/phase3-dashboard-improvements.md`
5. ✅ Update root `README.md` with Phase 3 summary
6. ✅ Commit: `feat(phase3): dashboard improvements with real data`
7. ✅ Push to `my-changes`

---

## Phase 4: Frontend Polish & Error Handling 🎨

**Priority:** MEDIUM | **Estimated Effort:** 2-3 hours

### Tasks
1. **Add error boundary component** — Catch and display React errors gracefully
2. **Add loading skeletons** — Replace spinners with skeleton loaders
3. **Fix parents search description** — Clarify searchable fields
4. **Add delete confirmation** for fee types

### Files to Modify
- `school-frontend/src/components/ErrorBoundary.jsx` (new)
- `school-frontend/src/components/LoadingSkeleton.jsx` (new)
- `school-frontend/src/main.jsx`
- `school-frontend/src/pages/Parents.jsx`
- `school-frontend/src/pages/Fees.jsx`
- `school-backend/app/routers.py` (fee type deletion endpoint)

### Verification
- [ ] Errors display in ErrorBoundary, not crash app
- [ ] Loading states show skeletons
- [ ] Parents search placeholder is accurate
- [ ] Fee types can be deleted with confirmation

### Phase Workflow
1. ✅ Implement code changes
2. ✅ Run `pytest` for backend tests
3. ✅ Run `npm test` for frontend tests
4. ✅ Create `docs/phase4-frontend-polish.md`
5. ✅ Update root `README.md` with Phase 4 summary
6. ✅ Commit: `feat(phase4): frontend polish and error handling`
7. ✅ Push to `my-changes`

---

## Phase 5: Testing & Documentation 🧪

**Priority:** HIGH | **Estimated Effort:** 4-5 hours

### Tasks
1. **Add backend unit tests** (pytest)
   - Test auth endpoints
   - Test CRUD operations
   - Test API validation
2. **Add frontend unit tests** (vitest)
   - Test components
   - Test API calls
   - Test auth flow
3. **Create comprehensive documentation**
   - API documentation
   - Developer setup guide
   - Deployment guide

### Files to Create
- `school-backend/tests/` (directory)
- `school-backend/tests/test_auth.py`
- `school-backend/tests/test_students.py`
- `school-backend/tests/test_parents.py`
- `school-backend/tests/test_teachers.py`
- `school-backend/tests/test_fees.py`
- `school-backend/tests/test_invoices.py`
- `school-backend/tests/test_payments.py`
- `school-frontend/src/__tests__/` (directory)
- `docs/api-documentation.md`
- `docs/developer-setup.md`
- `docs/deployment-guide.md`

### Verification
- [ ] All backend tests pass (`pytest`)
- [ ] All frontend tests pass (`npm test`)
- [ ] Documentation is accurate and complete

### Phase Workflow
1. ✅ Write backend tests
2. ✅ Write frontend tests
3. ✅ Create documentation
4. ✅ Run full test suite
5. ✅ Create `docs/phase5-testing-documentation.md`
6. ✅ Update root `README.md` with Phase 5 summary
7. ✅ Commit: `feat(phase5): comprehensive testing and documentation`
8. ✅ Push to `my-changes`

---

## Phase 6: Advanced Features 🚀

**Priority:** LOW | **Estimated Effort:** 5-6 hours

### Tasks
1. **Add CNIC search for parents** — Decrypt-and-compare or search index
2. **Add fee type deletion** — Complete CRUD for fee types
3. **Add dark mode support** — Theme toggle in UI
4. **Add export/print functionality** — PDF export for invoices

### Files to Modify
- `school-backend/app/routers.py`
- `school-backend/app/crud.py`
- `school-frontend/src/index.css`
- `school-frontend/src/components/ThemeToggle.jsx` (new)
- `school-frontend/src/pages/Fees.jsx`
- `school-frontend/src/pages/Invoices.jsx`

### Verification
- [ ] CNIC search works for parents
- [ ] Fee types can be deleted
- [ ] Dark mode toggle works
- [ ] Invoices can be exported/printed

### Phase Workflow
1. ✅ Implement code changes
2. ✅ Run `pytest` for backend tests
3. ✅ Run `npm test` for frontend tests
4. ✅ Create `docs/phase6-advanced-features.md`
5. ✅ Update root `README.md` with Phase 6 summary
6. ✅ Commit: `feat(phase6): advanced features and dark mode`
7. ✅ Push to `my-changes`

---

## 📊 Progress Tracking

| Phase | Status | Tests | Docs | Committed |
|-------|--------|-------|------|-----------|
| Phase 1: Security & Core | ✅ Complete | ✅ | ✅ | ✅ |
| Phase 2: User Management | ✅ Complete | ✅ | ✅ | ✅ |
| Phase 3: Dashboard | ✅ Complete | ✅ | ✅ | ✅ |
| Phase 4: Frontend Polish | ✅ Complete | ✅ | ✅ | ✅ |
| Phase 5: Testing & Docs | ✅ Complete | ✅ | ✅ | ✅ |
| Phase 6: Advanced Features | ⏳ Pending | ⏳ | ⏳ | ⏳ |

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
