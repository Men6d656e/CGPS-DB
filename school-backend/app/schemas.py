"""
Pydantic Schemas — Request & Response validation
"""

from __future__ import annotations

import re
from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict, field_validator, model_validator
from app.models import StudentStatus, InvoiceStatus, Relationship, UserRole, TeacherStatus
from app import models
from app.encryption import decrypt_field

# ─── CNIC / B-Form pattern ────────────────────────────────────────────────────
# Format: XXXXX-XXXXXXX-X  (13 digits + 2 dashes)
_CNIC_RE = re.compile(r"^\d{5}-\d{7}-\d$")


def _validate_cnic_or_bform(value: str) -> str:
    """Accept CNIC / B-Form in 13-digit format (XXXXX-XXXXXXX-X)."""
    if _CNIC_RE.match(value):
        return value
    raise ValueError(
        "Must be a valid CNIC / B-Form number "
        "(XXXXX-XXXXXXX-X — 13 digits)"
    )


# ─── Shared Config ────────────────────────────────────────────────────────────

class OrmBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# ─── Parents ──────────────────────────────────────────────────────────────────

class ParentCreate(BaseModel):
    guardian_name: str = Field(..., min_length=2, max_length=150)
    cnic: str = Field(..., description="Pakistani CNIC: XXXXX-XXXXXXX-X")
    contact_no: str = Field(..., min_length=10, max_length=20)
    whatsapp_no: Optional[str] = None
    address: Optional[str] = None

    @field_validator("cnic")
    @classmethod
    def validate_cnic(cls, v: str) -> str:
        return _validate_cnic_or_bform(v)


class ParentUpdate(BaseModel):
    guardian_name: Optional[str] = None
    contact_no: Optional[str] = None
    whatsapp_no: Optional[str] = None
    address: Optional[str] = None


class ParentOut(OrmBase):
    id: int
    guardian_name: str
    cnic: str
    contact_no: str
    whatsapp_no: Optional[str]
    address: Optional[str]
    created_at: datetime


class ParentBrief(OrmBase):
    id: int
    guardian_name: str
    cnic: str
    contact_no: str
    relationship: Optional[str] = None


class ParentWithStudents(ParentOut):
    students: list[StudentBrief] = []

    @model_validator(mode='before')
    @classmethod
    def extract_students(cls, data):
        if isinstance(data, models.Parent):
            data.students = [
                StudentBrief(
                    id=rel.student.id,
                    first_name=rel.student.first_name,
                    last_name=rel.student.last_name,
                    current_class=rel.student.current_class,
                    status=rel.student.status,
                )
                for rel in (data.student_links or []) if rel.student
            ]
        return data


# ─── Students ─────────────────────────────────────────────────────────────────

class StudentCreate(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    cnic_bform: str = Field(..., description="Pakistani B-Form: XXXXX-XXXXXXXX-X")
    dob: date
    admission_date: date
    current_class: str = Field(..., min_length=1, max_length=50)
    status: StudentStatus = StudentStatus.ACTIVE

    @field_validator("cnic_bform")
    @classmethod
    def validate_cnic_bform(cls, v: str) -> str:
        return _validate_cnic_or_bform(v)


class StudentUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    current_class: Optional[str] = None
    status: Optional[StudentStatus] = None
    # NOTE: cnic_bform intentionally excluded from updates


class StudentOut(OrmBase):
    id: int
    first_name: str
    last_name: str
    cnic_bform: str
    dob: date
    admission_date: date
    current_class: str
    status: StudentStatus
    created_at: datetime


class StudentWithParents(StudentOut):
    parents: list[ParentBrief] = []

    @model_validator(mode='before')
    @classmethod
    def extract_parents(cls, data):
        if isinstance(data, models.Student):
            data.parents = [
                ParentBrief(
                    id=rel.parent.id,
                    guardian_name=rel.parent.guardian_name,
                    cnic=decrypt_field(rel.parent.cnic) if rel.parent and rel.parent.cnic else None,
                    contact_no=rel.parent.contact_no,
                    relationship=rel.relationship.value if rel.relationship else None,
                )
                for rel in (data.parent_links or []) if rel.parent
            ]
        return data


class StudentBrief(OrmBase):
    id: int
    first_name: str
    last_name: str
    current_class: str
    status: StudentStatus


# ─── Student-Parent Link ──────────────────────────────────────────────────────

class LinkParentToStudent(BaseModel):
    parent_id: int
    relationship: Relationship


class StudentParentRelOut(OrmBase):
    id: int
    student_id: int
    parent_id: int
    relationship: Relationship


# ─── Teachers ────────────────────────────────────────────────────────────────

class TeacherCreate(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    email: Optional[str] = None
    phone: str = Field(..., min_length=10, max_length=20)
    subject: Optional[str] = None
    qualification: Optional[str] = None
    hire_date: date
    salary: Optional[Decimal] = None
    address: Optional[str] = None
    status: TeacherStatus = TeacherStatus.ACTIVE


class TeacherUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    subject: Optional[str] = None
    qualification: Optional[str] = None
    salary: Optional[Decimal] = None
    address: Optional[str] = None
    status: Optional[TeacherStatus] = None


class TeacherOut(OrmBase):
    id: int
    first_name: str
    last_name: str
    email: Optional[str]
    phone: str
    subject: Optional[str]
    qualification: Optional[str]
    hire_date: date
    salary: Optional[Decimal]
    address: Optional[str]
    status: TeacherStatus
    created_at: datetime


class TeacherBrief(OrmBase):
    id: int
    first_name: str
    last_name: str
    subject: Optional[str]
    status: TeacherStatus


# ─── Fee Types ────────────────────────────────────────────────────────────────

class FeeTypeCreate(BaseModel):
    fee_name: str = Field(..., min_length=1, max_length=100)
    default_amount: Decimal = Field(..., gt=0)
    description: Optional[str] = None
    is_active: bool = True


class FeeTypeUpdate(BaseModel):
    fee_name: Optional[str] = None
    default_amount: Optional[Decimal] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class FeeClassOverrideCreate(BaseModel):
    class_name: str
    amount: Decimal = Field(..., gt=0)


class FeeClassOverrideOut(OrmBase):
    id: int
    fee_type_id: int
    class_name: str
    amount: Decimal


class FeeTypeOut(OrmBase):
    id: int
    fee_name: str
    default_amount: Decimal
    description: Optional[str]
    is_active: bool
    class_overrides: list[FeeClassOverrideOut] = []


# ─── Invoices ─────────────────────────────────────────────────────────────────

class InvoiceLineItemCreate(BaseModel):
    fee_type_id: int
    amount: Decimal = Field(..., gt=0)


class InvoiceCreate(BaseModel):
    student_id: int
    billing_month: str = Field(..., pattern=r"^\d{4}-\d{2}$")  # "2026-04"
    due_date: date
    line_items: list[InvoiceLineItemCreate] = Field(..., min_length=1)


class InvoiceLineItemOut(OrmBase):
    id: int
    fee_type_id: int
    amount: Decimal
    fee_type: Optional[FeeTypeOut] = None


class InvoiceOut(OrmBase):
    id: int
    student_id: int
    billing_month: str
    due_date: date
    status: InvoiceStatus
    created_at: datetime
    line_items: list[InvoiceLineItemOut] = []
    total_amount: Optional[Decimal] = None
    amount_paid: Optional[Decimal] = None
    balance_due: Optional[Decimal] = None
    student: Optional[StudentBrief] = None


class InvoiceStatusUpdate(BaseModel):
    status: InvoiceStatus


# ─── Payments ─────────────────────────────────────────────────────────────────

class PaymentCreate(BaseModel):
    invoice_id: int
    amount_paid: Decimal = Field(..., gt=0)
    payment_date: date
    notes: Optional[str] = None


class PaymentOut(OrmBase):
    id: int
    invoice_id: int
    amount_paid: Decimal
    payment_date: date
    notes: Optional[str]
    created_at: datetime


# ─── Dashboard ────────────────────────────────────────────────────────────────

class DashboardStats(BaseModel):
    total_students: int
    active_students: int
    total_parents: int
    pending_invoices: int
    overdue_invoices: int
    total_collected_this_month: Decimal
    total_pending_amount: Decimal


class MonthlyCollection(BaseModel):
    month: str          # "2026-04"
    amount: Decimal


# ─── Authentication ────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(..., max_length=120)
    password: str = Field(..., min_length=8, max_length=128)   # raised minimum to 8
    full_name: Optional[str] = None
    role: UserRole = UserRole.STAFF


class UserOut(OrmBase):
    id: int
    username: str
    email: str
    full_name: Optional[str]
    role: UserRole
    is_active: bool
    is_superuser: bool
    created_at: datetime


class UserRoleUpdate(BaseModel):
    role: UserRole


class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=128)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenPair(BaseModel):
    """Access token + refresh token returned on login."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class LoginRequest(BaseModel):
    username: str
    password: str
