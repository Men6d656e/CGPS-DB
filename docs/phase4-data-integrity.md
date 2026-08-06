# 📋 Phase 4: Data Integrity & Indexes (SPEC2)

> **Completed:** 2026-08-06 | **Branch:** `my-changes`
> **Spec:** [SPEC/SPEC2.md](../SPEC/SPEC2.md)

---

## 🎯 Overview

Phase 4 of SPEC2 hardens the financial data model:

1. **Payment soft-void** — voiding a payment no longer destroys the row; `is_voided` preserves history
2. **Protect paid invoices** — invoices with payments can no longer be deleted
3. **Auto-detect overdue** — computed from `due_date` on read, no more manual-only button
4. **Missing indexes** — hot FK/query columns now indexed

---

## ✅ Changes Made

### 1. Payment Soft-Void

**Files:** `school-backend/app/models.py`, `school-backend/app/crud.py`

New `is_voided` column on `payments`:

```python
is_voided: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
```

- `crud.delete_payment()` → sets `is_voided = True` instead of `DELETE` (idempotent — already-voided returns as-is)
- `crud.attach_invoice_financials()` → `sum(p.amount_paid for p in invoice.payments if not p.is_voided)` — voided payments excluded from totals
- `crud.get_payments()` → filters `is_voided == False` by default (`include_voided=True` opt-in)
- Invoice status still auto-recalculates after a void (PENDING → PARTIAL → PAID and back)
- `PaymentOut` schema now exposes `is_voided`

### 2. Invoice Delete Protection

**File:** `school-backend/app/crud.py` + `routers.py`

```python
active_payments = [p for p in invoice.payments if not p.is_voided]
if active_payments:
    raise ValueError("Cannot delete an invoice with payments — void the payments first")
```

Router returns **400** with that message (previously a delete would cascade-destroy payment history).

### 3. Automatic Overdue Detection

**File:** `school-backend/app/crud.py`

`_apply_overdue()` marks an invoice overdue **in memory** when `status ∈ {pending, partial}` and `due_date < today` and balance > 0. Applied in `get_invoices()`; the `status=overdue` filter now queries the computed condition (pending/partial + past due). Dashboard's `overdue_invoices` counts manual `overdue` **or** the computed condition. No cron job required.

### 4. Missing Indexes

**File:** `school-backend/alembic/versions/d1e2f3a4b5c6_data_integrity_indexes.py` (new)

```python
op.create_index('ix_invoices_billing_month', 'invoices', ['billing_month'])
op.create_index('ix_invoices_student_id', 'invoices', ['student_id'])
op.create_index('ix_invoices_status', 'invoices', ['status'])
op.create_index('ix_payments_invoice_id', 'payments', ['invoice_id'])
op.create_index('ix_student_parent_rel_parent_id', 'student_parent_rel', ['parent_id'])
```

### 5. Tests Added

**File:** `school-backend/tests/test_crud_logic.py` (new, 8 tests)

- Financials: total/paid/balance, **voided payments excluded**, empty invoice
- `_to_enum`: lowercase → member mapping, invalid → None
- Overdue: past-due pending → overdue; paid invoice stays paid; future due date stays pending

---

## 🧪 Testing (verified by execution)

### Backend
```bash
cd school-backend && .venv/bin/python -m pytest -q
# → 25 passed, 9 warnings in 1.85s   (17 previous + 8 new)
```

### Frontend
```bash
cd school-frontend && npx vitest run   # → 2 passed
cd school-frontend && npx vite build   # → build OK
```

### Migration
✅ **Applied** on 2026-08-06 — `alembic upgrade head` run via the project venv. DB is now at revision `d1e2f3a4b5c6 (head)`. Verified: `payments.is_voided` column exists and all 5 indexes are present.

---

## 📚 Documentation

- Created `docs/phase4-data-integrity.md` (this file)
- Updated `README.md` — SPEC2 Phase 4 status → Complete
- Updated `SPEC/SPEC2.md` progress table

---

## 📊 Phase Status

| Task | Status |
|------|--------|
| `payments.is_voided` column + migration | ✅ Completed (apply migration manually) |
| Payment void = soft delete | ✅ Completed |
| Voided payments excluded from totals | ✅ Completed |
| Invoice delete blocked with payments | ✅ Completed |
| Auto-overdue on read (list + dashboard) | ✅ Completed |
| 5 indexes added | ✅ Completed (apply migration manually) |
| Backend tests (25 passed) | ✅ Verified |
| Frontend tests + build | ✅ Verified |

---

## 🔄 Git Workflow

```bash
git add school-backend/app/models.py school-backend/app/crud.py
git add school-backend/app/routers.py school-backend/app/schemas.py
git add school-backend/alembic/versions/d1e2f3a4b5c6_data_integrity_indexes.py
git add school-backend/tests/test_crud_logic.py
git add docs/phase4-data-integrity.md README.md SPEC/SPEC2.md
git commit -m 'feat(phase4-spec2): data integrity and indexes'
git push origin my-changes
```

---

## ⚠️ Notes

1. **Migration required** — `alembic upgrade head` must be run before this feature works in production.
2. **Overdue uses server-local date** (`date.today()`); timezone handling remains a future polish item.
3. The frontend "Void Payment" button now performs a soft void — no UI change needed (message already said "invoice balance updated").

---

*Next Phase: [Phase 5: Working Dark / Light Theme](phase5-working-theme.md)*
