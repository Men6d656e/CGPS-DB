"""Add revoked_tokens table for database-backed token revocation

Revision ID: g1h2i3j4k5l6
Revises: f8g8h9i0j1k3
Create Date: 2026-08-05
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'g1h2i3j4k5l6'
down_revision: Union[str, None] = 'f8g8h9i0j1k3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'revoked_tokens',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('token_jti', sa.String(36), nullable=False),
        sa.Column('revoked_at', sa.DateTime(), server_default=sa.func.now(), nullable=True),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('token_jti', name='uq_revoked_token_jti'),
    )
    op.create_index('ix_revoked_tokens_token_jti', 'revoked_tokens', ['token_jti'])


def downgrade() -> None:
    op.drop_index('ix_revoked_tokens_token_jti', table_name='revoked_tokens')
    op.drop_table('revoked_tokens')
