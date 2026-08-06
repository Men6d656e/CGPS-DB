"""
CRUD unit tests — financials, enum mapping, overdue detection (no DB needed)
"""

from datetime import date
from decimal import Decimal

from app import crud, models


class TestAttachInvoiceFinancials:
    """attach_invoice_financials must ignore voided payments."""

    def _invoice(self, items, payments):
        invoice = models.Invoice(id=1)
        invoice.line_items = [models.InvoiceLineItem(amount=Decimal(str(a))) for a in items]
        invoice.payments = payments
        return invoice

    def test_total_and_balance(self):
        invoice = self._invoice([1000, 500], [models.Payment(amount_paid=Decimal("300"))])
        fin = crud.attach_invoice_financials(invoice)
        assert fin["total_amount"] == Decimal("1500")
        assert fin["amount_paid"] == Decimal("300")
        assert fin["balance_due"] == Decimal("1200")

    def test_excludes_voided_payments(self):
        payments = [
            models.Payment(amount_paid=Decimal("300"), is_voided=False),
            models.Payment(amount_paid=Decimal("700"), is_voided=True),
        ]
        invoice = self._invoice([1000], payments)
        fin = crud.attach_invoice_financials(invoice)
        assert fin["amount_paid"] == Decimal("300")  # voided payment ignored

    def test_empty_invoice(self):
        invoice = self._invoice([], [])
        fin = crud.attach_invoice_financials(invoice)
        assert fin["total_amount"] == 0
        assert fin["amount_paid"] == 0
        assert fin["balance_due"] == 0


class TestToEnum:
    """_to_enum must map lowercase API values to enum members."""

    def test_maps_lowercase(self):
        assert crud._to_enum(models.StudentStatus, "active") == models.StudentStatus.ACTIVE
        assert crud._to_enum(models.StudentStatus, "withdrawn") == models.StudentStatus.WITHDRAWN
        assert crud._to_enum(models.InvoiceStatus, "partial") == models.InvoiceStatus.PARTIAL
        assert crud._to_enum(models.TeacherStatus, "resigned") == models.TeacherStatus.RESIGNED

    def test_invalid_value_raises(self):
        import pytest
        with pytest.raises(ValueError):
            crud._to_enum(models.StudentStatus, "bogus")
        with pytest.raises(ValueError):
            crud._to_enum(models.InvoiceStatus, "")


class TestOverdueDetection:
    """_apply_overdue must flag unpaid past-due invoices in memory."""

    def test_past_due_pending_is_overdue(self):
        invoice = models.Invoice(due_date=date(2026, 1, 1), status=models.InvoiceStatus.PENDING)
        invoice.line_items = [models.InvoiceLineItem(amount=Decimal("1000"))]
        invoice.payments = []
        crud._apply_overdue(invoice, date(2026, 2, 1))
        assert invoice.status == models.InvoiceStatus.OVERDUE

    def test_paid_invoice_not_overdue(self):
        invoice = models.Invoice(due_date=date(2026, 1, 1), status=models.InvoiceStatus.PAID)
        invoice.line_items = [models.InvoiceLineItem(amount=Decimal("1000"))]
        invoice.payments = [models.Payment(amount_paid=Decimal("1000"), is_voided=False)]
        crud._apply_overdue(invoice, date(2026, 2, 1))
        assert invoice.status == models.InvoiceStatus.PAID

    def test_future_due_date_not_overdue(self):
        invoice = models.Invoice(due_date=date(2026, 3, 1), status=models.InvoiceStatus.PENDING)
        invoice.line_items = [models.InvoiceLineItem(amount=Decimal("1000"))]
        invoice.payments = []
        crud._apply_overdue(invoice, date(2026, 2, 1))
        assert invoice.status == models.InvoiceStatus.PENDING
