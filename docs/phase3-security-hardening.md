# 📋 Phase 3: Security Hardening (SPEC2)

> **Completed:** 2026-08-06 | **Branch:** `my-changes`
> **Spec:** [SPEC/SPEC2.md](../SPEC/SPEC2.md)

---

## 🎯 Overview

Phase 3 of SPEC2 fixes two security weaknesses found in the deep codebase review:

1. **JWT revocation was dead code** — tokens were created *without* a `jti` claim, but the DB revocation list was only consulted when `jti` existed. Logged-out refresh tokens stayed valid.
2. **CNIC/B-Form dedup hashes were unsalted SHA-256** — trivially brute-forceable for a 13-digit identifier space.

---

## ✅ Changes Made

### 1. JWT `jti` Claim + Working Revocation

**File:** `school-backend/app/auth.py`

Both token creators now embed a unique `jti` (uuid hex):

```python
from uuid import uuid4

def create_access_token(data, expires_delta=None):
    ...
    to_encode.update({"exp": expire, "type": "access", "jti": uuid4().hex})
    return jwt.encode(...)

def create_refresh_token(data):
    ...
    to_encode.update({"exp": expire, "type": "refresh", "jti": uuid4().hex})
    return jwt.encode(...)
```

This activates the **existing** revocation logic that was already in place but never triggered:
- `decode_token()` checks `payload.get("jti")` against the `revoked_tokens` table (now always runs) ✅
- `revoke_token()` reads `payload.get("jti")` first (no more broken fallback to the username) ✅
- `/auth/logout` → revokes the specific refresh token; `/auth/refresh` → rejects revoked tokens with 401 ✅

### 2. Keyed HMAC Dedup Hashes

**File:** `school-backend/app/encryption.py` + `school-backend/app/config.py`

`hash_for_dedup()` now uses **HMAC-SHA256** keyed with a dedicated secret instead of raw SHA-256:

```python
# config.py
HASH_SECRET_KEY: str = ""   # falls back to SECRET_KEY when not set

# encryption.py
def _hash_secret() -> str:
    return settings.HASH_SECRET_KEY or settings.SECRET_KEY

def hash_for_dedup(value: str) -> str:
    return hmac.new(_hash_secret().encode(), value.encode("utf-8"), hashlib.sha256).hexdigest()
```

Without the key, an attacker cannot recompute hashes for candidate CNICs — brute-forcing the low-entropy space is no longer possible from a DB leak alone.

### 3. Re-Hash Data Script (safe, documented, NOT auto-run)

**File:** `school-backend/scripts/rehash_dedup_hashes.py` (new)

Mirrors the existing `encrypt_existing_data.py` pattern. Decrypts every student/parent record with the RSA private key and recomputes the keyed hash. Idempotent. Must be run **once manually** against the real database:

```bash
cd school-backend
python scripts/rehash_dedup_hashes.py
```

### 4. Tests Added

**Files:** `school-backend/tests/test_auth.py` (+2), `school-backend/tests/test_encryption.py` (new, +4)

- `test_access_token_has_jti` / `test_refresh_token_has_jti` — tokens carry a `jti`
- `test_deterministic` / `test_differs_across_values` / `test_keyed_not_plain_sha256` / `test_length` — HMAC hashing behavior

---

## 🧪 Testing (verified by execution)

### Backend
```bash
cd school-backend && .venv/bin/python -m pytest -q
# → 17 passed, 9 warnings in 1.88s   (11 previous + 6 new)
```

### Frontend
```bash
cd school-frontend && npx vitest run
# → 2 passed
```

---

## 📚 Documentation

- Created `docs/phase3-security-hardening.md` (this file)
- Updated `README.md` — SPEC2 Phase 3 status → Complete
- Updated `SPEC/SPEC2.md` progress table

---

## 📊 Phase Status

| Task | Status |
|------|--------|
| `jti` claim on access + refresh tokens | ✅ Completed |
| DB revocation now actually enforced | ✅ Completed |
| HMAC-SHA256 keyed dedup hashes | ✅ Completed |
| `HASH_SECRET_KEY` setting (SECRET_KEY fallback) | ✅ Completed |
| Re-hash data script | ✅ Created (run manually) |
| Backend tests (17 passed) | ✅ Verified |
| Frontend tests (2 passed) | ✅ Verified |

---

## 🔄 Git Workflow

```bash
git add school-backend/app/auth.py school-backend/app/config.py
git add school-backend/app/encryption.py
git add school-backend/scripts/rehash_dedup_hashes.py
git add school-backend/tests/test_auth.py school-backend/tests/test_encryption.py
git add docs/phase3-security-hardening.md README.md SPEC/SPEC2.md
git commit -m 'fix(phase3-spec2): security hardening'
git push origin my-changes
```

---

## ⚠️ Notes

1. ✅ **Re-hash script executed** on 2026-08-06 — `scripts/rehash_dedup_hashes.py` ran against the DB (2 students, 0 parents updated; stored hashes verified to match the new keyed HMAC scheme).
2. **Access tokens** are not added to the revocation list on logout (they're short-lived, 30 min) — standard practice.
3. The create/search paths also match legacy SHA-256 hashes (`legacy_sha256_hash`) so lookups work even before the re-hash script runs — the script has now been run, so all hashes are unified on HMAC.

---

*Next Phase: [Phase 4: Data Integrity & Indexes](phase4-data-integrity.md)*
