"""add role column to users table

Revision ID: a2b3c4d5e6f7
Revises: 4912a1b3c4d5
Create Date: 2026-07-10 13:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a2b3c4d5e6f7'
down_revision: Union[str, None] = '4912a1b3c4d5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users',
        sa.Column('role', sa.String(10), nullable=False, server_default='staff')
    )


def downgrade() -> None:
    op.drop_column('users', 'role')
