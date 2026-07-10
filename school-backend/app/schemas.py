"""
Pydantic Schemas — Request & Response validation
"""

from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict
from app.models import StudentStatus, InvoiceStatus, Relationship, UserRole


# ─── Shared Config ────────────────────────────────────────────────────────────

class OrmBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# ─── Parents ──────────────────────────────────────────────────────────────────

class ParentCreate(BaseModel):
    guardian_name: str = Field(..., min_length=2, max_length=150)
    cnic: str = Field(..., min_length=13, max_length=20)
    contact_no: str = Field(..., min_length=10, max_length=20)
    whatsapp_no: Optional[str] = None
    address: Optional[str] = None


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


# ─── Students ─────────────────────────────────────────────────────────────────

class StudentCreate(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    cnic_bform: str = Field(..., min_length=13, max_length=20)
    dob: date
    admission_date: date
    current_class: str = Field(..., min_length=1, max_length=50)
    status: StudentStatus = StudentStatus.ACTIVE


class StudentUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    current_class: Optional[str] = None
    status: Optional[StudentStatus] = None


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


# ─── Authentication ────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(..., max_length=120)
    password: str = Field(..., min_length=6, max_length=128)
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


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    username: str
    password: str
