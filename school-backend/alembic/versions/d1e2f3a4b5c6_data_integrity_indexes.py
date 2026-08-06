"""data integrity: payment soft-void flag and missing indexes

Revision ID: d1e2f3a4b5c6
Revises: g1h2i3j4k5l6
Create Date: 2026-08-06

SPEC2 Phase 4 — adds:
- payments.is_voided (soft-void instead of hard DELETE)
- indexes on hot FK/query columns that Postgres does not auto-index
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd1e2f3a4b5c6'
down_revision: Union[str, None] = 'g1h2i3j4k5l6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Payment soft-void flag
    op.add_column(
        'payments',
        sa.Column('is_voided', sa.Boolean(), server_default=sa.text('false'), nullable=False),
    )

    # Missing indexes on hot query columns
    op.create_index('ix_invoices_billing_month', 'invoices', ['billing_month'])
    op.create_index('ix_invoices_student_id', 'invoices', ['student_id'])
    op.create_index('ix_invoices_status', 'invoices', ['status'])
    op.create_index('ix_payments_invoice_id', 'payments', ['invoice_id'])
    op.create_index('ix_student_parent_rel_parent_id', 'student_parent_rel', ['parent_id'])


def downgrade() -> None:
    op.drop_index('ix_student_parent_rel_parent_id', table_name='student_parent_rel')
    op.drop_index('ix_payments_invoice_id', table_name='payments')
    op.drop_index('ix_invoices_status', table_name='invoices')
    op.drop_index('ix_invoices_student_id', table_name='invoices')
    op.drop_index('ix_invoices_billing_month', table_name='invoices')
    op.drop_column('payments', 'is_voided')
