"""encrypt existing plaintext CNIC / B-Form data

Revision ID: f7g8h9i0j1k2
Revises: b1c2d3e4f5g6
Create Date: 2026-07-11 12:00:00.000000

This data migration encrypts any existing plaintext CNIC / B-Form values
that were left behind by the schema-only migration b1c2d3e4f5g6.

It also fixes empty hash columns on already-encrypted rows (a side-effect
of the previous migration's server_default='' placeholder).

The revision is idempotent: values already encrypted are skipped.
Uses op.get_bind() for a sync connection + app.encryption for crypto.
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import text as sql_text

# revision identifiers, used by Alembic.
revision: str = "f7g8h9i0j1k2"
down_revision: Union[str, None] = "b1c2d3e4f5g6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Encrypt existing plaintext CNIC / B-Form values in-place."""
    from app.encryption import encrypt_field, is_encrypted, hash_for_dedup

    connection = op.get_bind()

    # ── Students ──────────────────────────────────────────────────────────
    _encrypt_column(
        connection,
        encrypt_fn=encrypt_field,
        is_encrypted_fn=is_encrypted,
        hash_fn=hash_for_dedup,
        table="students",
        id_col="id",
        value_col="cnic_bform",
        hash_col="cnic_bform_hash",
    )

    # ── Parents ───────────────────────────────────────────────────────────
    _encrypt_column(
        connection,
        encrypt_fn=encrypt_field,
        is_encrypted_fn=is_encrypted,
        hash_fn=hash_for_dedup,
        table="parents",
        id_col="id",
        value_col="cnic",
        hash_col="cnic_hash",
    )


def downgrade() -> None:
    """There is no safe way to reverse asymmetric encryption.
    If you must revert, restore from a backup before running
    `alembic downgrade f7g8h9i0j1k2`."""
    pass


# ─── Helper ───────────────────────────────────────────────────────────────────

def _encrypt_column(
    connection,
    encrypt_fn,
    is_encrypted_fn,
    hash_fn,
    table: str,
    id_col: str,
    value_col: str,
    hash_col: str,
) -> None:
    """Read rows from *table* and encrypt plaintext *value_col* values.

    Also fixes rows that are already encrypted but have an empty *hash_col*
    (leftover from the previous migration's server_default='').
    """

    rows = connection.execute(
        sql_text(
            f"SELECT {id_col}, {value_col}, {hash_col} FROM {table}"
        )
    ).fetchall()

    encrypted_count = 0
    hash_fixed_count = 0
    skipped_count = 0
    error_count = 0

    for row in rows:
        row_id = row[0]
        raw_value = row[1]
        current_hash = row[2]

        if not raw_value:
            skipped_count += 1
            continue

        if is_encrypted_fn(raw_value):
            # Already encrypted — fix the hash if it's missing/empty
            if not current_hash:
                try:
                    # Import decrypt_field lazily (only needed for this edge case)
                    from app.encryption import decrypt_field
                    plain = decrypt_field(raw_value)
                    h = hash_fn(plain)
                    connection.execute(
                        sql_text(
                            f"UPDATE {table} SET {hash_col} = :hash "
                            f"WHERE {id_col} = :rid"
                        ),
                        {"hash": h, "rid": row_id},
                    )
                    hash_fixed_count += 1
                except Exception as exc:
                    error_count += 1
                    print(
                        f"   ✗ {table} #{row_id}: hash fix ERROR — {exc}",
                        flush=True,
                    )
            else:
                skipped_count += 1
            continue

        # Plaintext — encrypt and compute hash
        try:
            cipher = encrypt_fn(raw_value)
            h = hash_fn(raw_value)
            connection.execute(
                sql_text(
                    f"UPDATE {table} "
                    f"SET {value_col} = :cipher, {hash_col} = :hash "
                    f"WHERE {id_col} = :rid"
                ),
                {"cipher": cipher, "hash": h, "rid": row_id},
            )
            encrypted_count += 1
        except Exception as exc:
            error_count += 1
            print(
                f"   ✗ {table} #{row_id}: encrypt ERROR — {exc}",
                flush=True,
            )

    print(
        f"  {table}: {encrypted_count} encrypted, {hash_fixed_count} hash-fixed, "
        f"{skipped_count} skipped, {error_count} errors",
        flush=True,
    )
