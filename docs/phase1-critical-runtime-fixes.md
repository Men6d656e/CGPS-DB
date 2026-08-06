# 📋 Phase 1: Critical Runtime Fixes (SPEC2)

> **Completed:** 2026-08-06 | **Branch:** `my-changes`
> **Spec:** [SPEC/SPEC2.md](../SPEC/SPEC2.md)

---

## 🎯 Overview

Phase 1 of SPEC2 fixes three runtime-critical bugs found in the deep codebase review (`project-overview3.md`):

1. **Users page crash** — a JavaScript temporal-dead-zone (TDZ) bug crashed the whole app on `/users`
2. **Enum case mismatch** — SQLAlchemy `SAEnum` stores enum *names* (`ACTIVE`) while the API/frontend use lowercase (`active`), breaking every status filter and the dashboard stat counts
3. **Dashboard chart shows wrong months** — `get_monthly_collections` returned the **oldest** N months instead of the most recent

---

## ✅ Changes Made

### 1. Fixed Users Page Crash (TDZ bug)

**File:** `school-frontend/src/pages/Users.jsx`

The component used `user` inside a `useEffect` *before* `const { user } = useAuth()` was declared (it was at the bottom of the component body). Accessing a `const` before its declaration throws `ReferenceError: Cannot access 'user' before initialization` on every render — navigating to `/users` crashed the entire SPA (only the ErrorBoundary caught it).

```jsx
// Before (crashes):
export default function Users() {
  const [users, setUsers] = useState([])
  // ...
  useEffect(() => { if (user?.role === 'admin') load() }, [user])  // 💥 user in TDZ
  // ...
  const { user } = useAuth()   // declared too late
  if (user?.role !== 'admin') { return <AccessDenied/> }

// After (fixed):
export default function Users() {
  const { user } = useAuth()   // hoisted to the top
  const [users, setUsers] = useState([])
  // ...
  useEffect(() => { if (user?.role === 'admin') load() }, [user])  // ✅ safe
  // ...
  if (user?.role !== 'admin') { return <AccessDenied/> }
}
```

### 2. Fixed Enum Case Mismatch

**File:** `school-backend/app/crud.py`

SQLAlchemy's `Enum(SomePythonEnum)` persists the enum **name** (e.g. `ACTIVE`) unless `values_callable` is set. The DB enum types therefore contain `ACTIVE`, `WITHDRAWN`, `PENDING`, etc., but the API accepts/returns lowercase (`active`, `pending`). Comparing the column to a raw lowercase string (`Student.status == "active"`) made PostgreSQL raise `invalid input value for enum` — status filters and dashboard counts were broken.

**Fix:** added a `_to_enum()` helper that maps the lowercase API value to its enum member (which SQLAlchemy correctly binds as the stored name), and used it in all status filters and dashboard queries.

```python
def _to_enum(enum_cls, value):
    """Map a lowercase API value to its enum member."""
    try:
        return enum_cls(value)
    except ValueError:
        return None

# get_students / get_teachers / get_invoices filters:
if status:
    status_enum = _to_enum(models.StudentStatus, status)
    if status_enum:
        q = q.where(models.Student.status == status_enum)

# get_dashboard_stats — compare with enum members, not raw strings:
active_students = count(Student.id).where(Student.status == models.StudentStatus.ACTIVE)
pending_invoices = count(Invoice.id).where(Invoice.status == models.InvoiceStatus.PENDING)
overdue_invoices  = count(Invoice.id).where(Invoice.status == models.InvoiceStatus.OVERDUE)
```

**Fixed endpoints:**
- `GET /students?status=...` ✅
- `GET /teachers?status=...` ✅
- `GET /invoices?status=...` ✅
- `GET /dashboard/stats` (`active_students`, `pending_invoices`, `overdue_invoices`, `total_pending_amount`) ✅

### 3. Fixed Monthly Collections Ordering

**File:** `school-backend/app/crud.py`

`get_monthly_collections()` ordered by `billing_month` **ascending** and applied `.limit(months)` — so the dashboard chart plotted the **oldest** months in the table, not the last 6.

```python
# Before: oldest N months ⚠️
.order_by(models.Invoice.billing_month).limit(months)

# After: most recent N months, ascending for the chart ✅
.order_by(models.Invoice.billing_month.desc()).limit(months)
# ...
rows.reverse()
```

---

## 🧪 Testing

### Backend
- ✅ `app/crud.py` parses and imports cleanly (`from app import crud`)
- ✅ Enum filters now compare via enum members (valid for PG native enum columns)
- ✅ Dashboard counts use `StudentStatus.ACTIVE` / `InvoiceStatus.PENDING|OVERDUE`

### Frontend
- ✅ `npm run build` passes
- ✅ `/users` no longer throws at render (TDZ eliminated)

> Full test suites (pytest/vitest) were still broken at this point — they are restored in **Phase 2** of SPEC2.

---

## 📚 Documentation

- Created `docs/phase1-critical-runtime-fixes.md` (this file)
- Updated `README.md` — SPEC2 Phase 1 status → In Progress/Complete
- Updated `SPEC/SPEC2.md` progress table

---

## 📊 Phase Status

| Task | Status |
|------|--------|
| Fix Users.jsx TDZ crash | ✅ Completed |
| Fix enum case mismatch (filters + dashboard) | ✅ Completed |
| Fix monthly collections ordering | ✅ Completed |
| Frontend build passes | ✅ Verified |
| Backend imports cleanly | ✅ Verified |
| Documentation | ✅ Completed |

---

## 🔄 Git Workflow

```bash
git add school-frontend/src/pages/Users.jsx
git add school-backend/app/crud.py
git add docs/phase1-critical-runtime-fixes.md
git add README.md SPEC/SPEC2.md
git commit -m 'fix(phase1-spec2): critical runtime fixes'
git push origin my-changes
```

---

## ⚠️ Notes

1. **Enum fix approach** — chosen a code-only fix (compare via enum members) instead of migrating stored values to lowercase; avoids the messy Postgres enum-type replacement and keeps existing rows untouched.
2. **Monthly chart** — months with zero collections still don't appear as empty bars; that's a chart-polish item, not a correctness bug.
3. **Overdue** is still manual-only (auto-detection is scheduled for **Phase 4** of SPEC2).

---

*Next Phase: [Phase 2: Restore Broken Testing Infrastructure](phase2-restore-testing.md)*
