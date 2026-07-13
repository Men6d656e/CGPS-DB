"""add teachers table

Revision ID: f8g8h9i0j1k3
Revises: f7g8h9i0j1k2
Create Date: 2026-07-12 18:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f8g8h9i0j1k3'
down_revision: Union[str, None] = 'f7g8h9i0j1k2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('teachers',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('first_name', sa.String(length=100), nullable=False),
        sa.Column('last_name', sa.String(length=100), nullable=False),
        sa.Column('email', sa.String(length=120), nullable=True),
        sa.Column('phone', sa.String(length=20), nullable=False),
        sa.Column('subject', sa.String(length=100), nullable=True),
        sa.Column('qualification', sa.String(length=200), nullable=True),
        sa.Column('hire_date', sa.Date(), nullable=False),
        sa.Column('salary', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('status', sa.Enum('ACTIVE', 'INACTIVE', 'RESIGNED', name='teacherstatus'), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('teachers')
