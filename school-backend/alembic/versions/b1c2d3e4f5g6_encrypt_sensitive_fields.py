"""encrypt sensitive fields with RSA

Revision ID: b1c2d3e4f5g6
Revises: a2b3c4d5e6f7
Create Date: 2026-07-10 14:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b1c2d3e4f5g6'
down_revision: Union[str, None] = 'a2b3c4d5e6f7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # --- Students ---
    # Remove the old unique constraint on cnic_bform
    op.drop_constraint('students_cnic_bform_key', 'students', type_='unique')
    # Change cnic_bform from String(20) to Text
    op.alter_column('students', 'cnic_bform',
        type_=sa.Text(),
        existing_type=sa.String(20),
        nullable=False,
    )
    # Add cnic_bform_hash column for uniqueness checking
    op.add_column('students',
        sa.Column('cnic_bform_hash', sa.String(64), nullable=False, server_default='')
    )
    op.create_unique_constraint('uq_students_cnic_bform_hash', 'students', ['cnic_bform_hash'])
    op.create_index('ix_students_cnic_bform_hash', 'students', ['cnic_bform_hash'])

    # --- Parents ---
    # Remove the old unique constraint on cnic
    op.drop_constraint('parents_cnic_key', 'parents', type_='unique')
    # Change cnic from String(20) to Text
    op.alter_column('parents', 'cnic',
        type_=sa.Text(),
        existing_type=sa.String(20),
        nullable=False,
    )
    # Add cnic_hash column for uniqueness checking
    op.add_column('parents',
        sa.Column('cnic_hash', sa.String(64), nullable=False, server_default='')
    )
    op.create_unique_constraint('uq_parents_cnic_hash', 'parents', ['cnic_hash'])
    op.create_index('ix_parents_cnic_hash', 'parents', ['cnic_hash'])

    # Remove server_default after migration completes (we don't want default on new rows)
    op.alter_column('students', 'cnic_bform_hash', server_default=None)
    op.alter_column('parents', 'cnic_hash', server_default=None)


def downgrade() -> None:
    # --- Parents ---
    op.drop_index('ix_parents_cnic_hash', table_name='parents')
    op.drop_constraint('uq_parents_cnic_hash', 'parents', type_='unique')
    op.drop_column('parents', 'cnic_hash')
    op.alter_column('parents', 'cnic',
        type_=sa.String(20),
        existing_type=sa.Text(),
        nullable=False,
    )
    op.create_unique_constraint('parents_cnic_key', 'parents', ['cnic'])

    # --- Students ---
    op.drop_index('ix_students_cnic_bform_hash', table_name='students')
    op.drop_constraint('uq_students_cnic_bform_hash', 'students', type_='unique')
    op.drop_column('students', 'cnic_bform_hash')
    op.alter_column('students', 'cnic_bform',
        type_=sa.String(20),
        existing_type=sa.Text(),
        nullable=False,
    )
    op.create_unique_constraint('students_cnic_bform_key', 'students', ['cnic_bform'])
