"""
Re-hash Dedup Hashes — One-time data migration script

Recomputes the CNIC/B-Form dedup hashes (cnic_bform_hash / cnic_hash) using the
keyed HMAC-SHA256 function (app.encryption.hash_for_dedup) instead of the old
unsalted SHA-256. This must be run once after deploying Phase 3 of SPEC2 so
uniqueness lookups keep working for existing rows.

Usage:
    cd school-backend
    python scripts/rehash_dedup_hashes.py

The script is idempotent — running it again recomputes the same values.
It decrypts each record with the RSA private key and re-hashes the plaintext.
"""

import asyncio
import sys
from pathlib import Path

# Ensure the project root is on sys.path so `from app import …` works
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from app.config import settings
from app import models
from app.encryption import decrypt_field, hash_for_dedup


async def rehash() -> None:
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as db:
        # ── Students ──────────────────────────────────────────────────────
        print("── Re-hashing student records ...")
        students = (await db.execute(select(models.Student))).scalars().all()
        updated = 0
        for s in students:
            if not s.cnic_bform:
                continue
            plain = decrypt_field(s.cnic_bform)
            new_hash = hash_for_dedup(plain)
            if new_hash != s.cnic_bform_hash:
                s.cnic_bform_hash = new_hash
                updated += 1
        print(f"   → {updated}/{len(students)} students updated")

        # ── Parents ───────────────────────────────────────────────────────
        print("── Re-hashing parent records ...")
        parents = (await db.execute(select(models.Parent))).scalars().all()
        updated = 0
        for p in parents:
            if not p.cnic:
                continue
            plain = decrypt_field(p.cnic)
            new_hash = hash_for_dedup(plain)
            if new_hash != p.cnic_hash:
                p.cnic_hash = new_hash
                updated += 1
        print(f"   → {updated}/{len(parents)} parents updated")

        await db.commit()
        print("✅ Committed.")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(rehash())
