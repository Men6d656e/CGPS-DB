"""
Encrypt Existing Data — One-time migration script

Migrates existing plaintext CNIC/B-Form values in the database to RSA-encrypted
form.  Also populates the corresponding hash columns for uniqueness checking.

Usage:
    cd school-backend
    python scripts/encrypt_existing_data.py

The script is idempotent: it skips records whose values are already encrypted.
"""

import asyncio
import sys
from pathlib import Path

# Ensure the project root is on sys.path so `from app import …` works
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from app.config import settings
from app import models
from app.encryption import is_encrypted, ensure_encrypted


async def migrate() -> None:
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as db:
        # ── Students ──────────────────────────────────────────────────────
        print("── Checking student records ...")
        result = await db.execute(select(models.Student))
        students = result.scalars().all()

        encrypted_count = 0
        skipped_count = 0
        error_count = 0

        for s in students:
            if not s.cnic_bform:
                print(f"   ⚠ Student #{s.id}: empty cnic_bform, skipping")
                skipped_count += 1
                continue
            if is_encrypted(s.cnic_bform):
                print(f"   ✓ Student #{s.id} ({s.full_name}): already encrypted")
                skipped_count += 1
                continue
            try:
                encrypted, h = ensure_encrypted(s.cnic_bform)
                s.cnic_bform = encrypted
                s.cnic_bform_hash = h
                encrypted_count += 1
                print(f"   → Student #{s.id} ({s.full_name}): encrypted ✓")
            except Exception as exc:
                error_count += 1
                print(f"   ✗ Student #{s.id} ({s.full_name}): ERROR — {exc}")

        # ── Parents ───────────────────────────────────────────────────────
        print("\n── Checking parent records ...")
        result = await db.execute(select(models.Parent))
        parents = result.scalars().all()

        for p in parents:
            if not p.cnic:
                print(f"   ⚠ Parent #{p.id}: empty cnic, skipping")
                skipped_count += 1
                continue
            if is_encrypted(p.cnic):
                print(f"   ✓ Parent #{p.id} ({p.guardian_name}): already encrypted")
                skipped_count += 1
                continue
            try:
                encrypted, h = ensure_encrypted(p.cnic)
                p.cnic = encrypted
                p.cnic_hash = h
                encrypted_count += 1
                print(f"   → Parent #{p.id} ({p.guardian_name}): encrypted ✓")
            except Exception as exc:
                error_count += 1
                print(f"   ✗ Parent #{p.id} ({p.guardian_name}): ERROR — {exc}")

        # ── Commit ────────────────────────────────────────────────────────
        print(f"\n── Summary: {encrypted_count} encrypted, {skipped_count} skipped, {error_count} errors")
        if encrypted_count > 0:
            await db.commit()
            print("✅ Committed.")
        else:
            print("ℹ No changes to commit.")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(migrate())
