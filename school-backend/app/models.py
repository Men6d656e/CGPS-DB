"""
SQLAlchemy Models — School Management System
Schema Design Decisions:
  - One invoice per student per month (not per fee type)
  - invoice_line_items stores per-fee breakdown
  - Invoice status: pending / partial / paid / overdue
  - Siblings are derived from shared parents (no extra table)
  - Balance is always derived: total_amount - SUM(payments)
"""

import enum
from datetime import date, datetime
from decimal import Decimal
from sqlalchemy import (
    Integer, String, Text, Date, DateTime, Numeric,
    ForeignKey, Enum as SAEnum, UniqueConstraint, func
)
from sqlalchemy.orm import Mapped, mapped_column, relationship, relationship as orm_relationship
from app.database import Base


# ─── Enums ────────────────────────────────────────────────────────────────────

class StudentStatus(str, enum.Enum):
    ACTIVE = "active"
    WITHDRAWN = "withdrawn"
    GRADUATED = "graduated"


class InvoiceStatus(str, enum.Enum):
    PENDING = "pending"
    PARTIAL = "partial"
    PAID = "paid"
    OVERDUE = "overdue"


class Relationship(str, enum.Enum):
    FATHER = "Father"
    MOTHER = "Mother"
    GUARDIAN = "Guardian"
    OTHER = "Other"


# ─── Students ─────────────────────────────────────────────────────────────────

class Student(Base):
    __tablename__ = "students"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    cnic_bform: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    dob: Mapped[date] = mapped_column(Date, nullable=False)
    admission_date: Mapped[date] = mapped_column(Date, nullable=False)
    current_class: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[StudentStatus] = mapped_column(
        SAEnum(StudentStatus), default=StudentStatus.ACTIVE, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    # Relationships
    parent_links: Mapped[list["StudentParentRel"]] = relationship(
        back_populates="student", cascade="all, delete-orphan"
    )
    invoices: Mapped[list["Invoice"]] = relationship(
        back_populates="student", cascade="all, delete-orphan"
    )

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"


# ─── Parents / Guardians ──────────────────────────────────────────────────────

class Parent(Base):
    __tablename__ = "parents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    guardian_name: Mapped[str] = mapped_column(String(150), nullable=False)
    cnic: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    contact_no: Mapped[str] = mapped_column(String(20), nullable=False)
    whatsapp_no: Mapped[str | None] = mapped_column(String(20), nullable=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    # Relationships
    student_links: Mapped[list["StudentParentRel"]] = relationship(
        back_populates="parent", cascade="all, delete-orphan"
    )


# ─── Student-Parent Bridge ────────────────────────────────────────────────────

class StudentParentRel(Base):
    __tablename__ = "student_parent_rel"
    __table_args__ = (
        UniqueConstraint("student_id", "parent_id", name="uq_student_parent"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id", ondelete="CASCADE"))
    parent_id: Mapped[int] = mapped_column(ForeignKey("parents.id", ondelete="CASCADE"))
    relationship: Mapped[Relationship] = mapped_column(SAEnum(Relationship), nullable=False)

    student: Mapped["Student"] = orm_relationship(back_populates="parent_links")
    parent: Mapped["Parent"] = orm_relationship(back_populates="student_links")


# ─── Fee Types (Price List) ───────────────────────────────────────────────────

class FeeType(Base):
    __tablename__ = "fee_types"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    fee_name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    default_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)

    # Relationships
    class_overrides: Mapped[list["FeeClassOverride"]] = relationship(
        back_populates="fee_type", cascade="all, delete-orphan"
    )
    line_items: Mapped[list["InvoiceLineItem"]] = relationship(back_populates="fee_type")


# ─── Fee Class Overrides (Different fee per class) ───────────────────────────

class FeeClassOverride(Base):
    __tablename__ = "fee_class_overrides"
    __table_args__ = (
        UniqueConstraint("fee_type_id", "class_name", name="uq_fee_class"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    fee_type_id: Mapped[int] = mapped_column(ForeignKey("fee_types.id", ondelete="CASCADE"))
    class_name: Mapped[str] = mapped_column(String(50), nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)

    fee_type: Mapped["FeeType"] = relationship(back_populates="class_overrides")


# ─── Invoices (One per student per month) ────────────────────────────────────

class Invoice(Base):
    __tablename__ = "invoices"
    __table_args__ = (
        UniqueConstraint("student_id", "billing_month", name="uq_student_month"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id", ondelete="CASCADE"))
    billing_month: Mapped[str] = mapped_column(String(7), nullable=False)  # "2026-04"
    due_date: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[InvoiceStatus] = mapped_column(
        SAEnum(InvoiceStatus), default=InvoiceStatus.PENDING, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    # Relationships
    student: Mapped["Student"] = relationship(back_populates="invoices")
    line_items: Mapped[list["InvoiceLineItem"]] = relationship(
        back_populates="invoice", cascade="all, delete-orphan"
    )
    payments: Mapped[list["Payment"]] = relationship(
        back_populates="invoice", cascade="all, delete-orphan"
    )


# ─── Invoice Line Items (Per-fee breakdown) ───────────────────────────────────

class InvoiceLineItem(Base):
    __tablename__ = "invoice_line_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    invoice_id: Mapped[int] = mapped_column(ForeignKey("invoices.id", ondelete="CASCADE"))
    fee_type_id: Mapped[int] = mapped_column(ForeignKey("fee_types.id", ondelete="RESTRICT"))
    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)

    invoice: Mapped["Invoice"] = relationship(back_populates="line_items")
    fee_type: Mapped["FeeType"] = relationship(back_populates="line_items")


# ─── Payments (Actual cash/bank transactions) ─────────────────────────────────

class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    invoice_id: Mapped[int] = mapped_column(ForeignKey("invoices.id", ondelete="CASCADE"))
    amount_paid: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    payment_date: Mapped[date] = mapped_column(Date, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    invoice: Mapped["Invoice"] = relationship(back_populates="payments")
