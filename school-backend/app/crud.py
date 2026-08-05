"""
CRUD Operations — Database logic separated from routes
"""

from datetime import date, datetime
from decimal import Decimal
from sqlalchemy import select, func, and_, desc, text
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm.attributes import set_committed_value

from app import models, schemas
from app.auth import get_password_hash
from app.encryption import encrypt_field, decrypt_field, hash_for_dedup


# ─── Users (Authentication) ───────────────────────────────────────────────────

async def get_user_by_username(db: AsyncSession, username: str):
    q = select(models.User).where(models.User.username == username)
    result = await db.execute(q)
    return result.scalar_one_or_none()


async def get_user_by_email(db: AsyncSession, email: str):
    q = select(models.User).where(models.User.email == email)
    result = await db.execute(q)
    return result.scalar_one_or_none()


async def create_user(db: AsyncSession, data: schemas.UserCreate):
    user = models.User(
        username=data.username,
        email=data.email,
        hashed_password=get_password_hash(data.password),
        full_name=data.full_name,
        role=data.role,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)
    return user


async def get_users(db: AsyncSession, skip: int = 0, limit: int = 100):
    q = select(models.User).offset(skip).limit(limit).order_by(models.User.username)
    result = await db.execute(q)
    return result.scalars().all()


async def update_user_role(db: AsyncSession, user_id: int, role: schemas.UserRole):
    user = await get_user_by_id(db, user_id)
    if not user:
        return None
    user.role = role
    await db.flush()
    return user


async def update_user_password(db: AsyncSession, user_id: int, new_password: str):
    user = await get_user_by_id(db, user_id)
    if not user:
        return None
    user.hashed_password = get_password_hash(new_password)
    await db.flush()
    return user


async def get_user_by_id(db: AsyncSession, user_id: int):
    q = select(models.User).where(models.User.id == user_id)
    result = await db.execute(q)
    return result.scalar_one_or_none()


# ─── Students ─────────────────────────────────────────────────────────────────

def _decrypt_student_cnic(student: models.Student):
    """Decrypt the cnic_bform on a Student object without marking it as dirty."""
    if student and student.cnic_bform:
        plain = decrypt_field(student.cnic_bform)
        set_committed_value(student, 'cnic_bform', plain)


async def get_students(db: AsyncSession, skip: int = 0, limit: int = 50, status: str = None, search: str = None):
    q = select(models.Student).options(
        selectinload(models.Student.parent_links).selectinload(models.StudentParentRel.parent)
    )
    if status:
        q = q.where(models.Student.status == status)
    if search:
        pattern = f"%{search}%"
        q = q.where(
            models.Student.first_name.ilike(pattern)
            | models.Student.last_name.ilike(pattern)
            | models.Student.current_class.ilike(pattern)
        )
    q = q.offset(skip).limit(limit).order_by(desc(models.Student.created_at))
    result = await db.execute(q)
    students = result.scalars().all()
    for s in students:
        _decrypt_student_cnic(s)
    return students


async def get_student(db: AsyncSession, student_id: int):
    q = select(models.Student).options(
        selectinload(models.Student.parent_links).selectinload(models.StudentParentRel.parent),
        selectinload(models.Student.invoices)
    ).where(models.Student.id == student_id)
    result = await db.execute(q)
    student = result.scalar_one_or_none()
    _decrypt_student_cnic(student)
    return student


async def create_student(db: AsyncSession, data: schemas.StudentCreate):
    cnic_hash = hash_for_dedup(data.cnic_bform)
    existing = await db.execute(
        select(models.Student).where(models.Student.cnic_bform_hash == cnic_hash)
    )
    if existing.scalar_one_or_none():
        raise ValueError("Student with this CNIC/B-Form already exists")

    student = models.Student(
        first_name=data.first_name,
        last_name=data.last_name,
        cnic_bform=encrypt_field(data.cnic_bform),
        cnic_bform_hash=cnic_hash,
        dob=data.dob,
        admission_date=data.admission_date,
        current_class=data.current_class,
        status=data.status,
    )
    db.add(student)
    await db.flush()
    await db.refresh(student)
    plain = decrypt_field(student.cnic_bform)
    set_committed_value(student, 'cnic_bform', plain)
    return student


async def update_student(db: AsyncSession, student_id: int, data: schemas.StudentUpdate):
    student = await get_student(db, student_id)
    if not student:
        return None
    # Explicitly exclude cnic_bform — it should never be updated via PATCH
    safe_fields = {"first_name", "last_name", "current_class", "status"}
    for field, value in data.model_dump(exclude_none=True).items():
        if field in safe_fields:
            setattr(student, field, value)
    await db.flush()
    student = await get_student(db, student_id)
    return student


async def delete_student(db: AsyncSession, student_id: int):
    student = await get_student(db, student_id)
    if student:
        await db.delete(student)
        await db.flush()
    return student


async def get_siblings(db: AsyncSession, student_id: int):
    """Get siblings: students sharing at least one parent."""
    parent_ids_q = select(models.StudentParentRel.parent_id).where(
        models.StudentParentRel.student_id == student_id
    )
    sibling_ids_q = select(models.StudentParentRel.student_id).where(
        and_(
            models.StudentParentRel.parent_id.in_(parent_ids_q),
            models.StudentParentRel.student_id != student_id
        )
    ).distinct()
    sibling_q = select(models.Student).where(models.Student.id.in_(sibling_ids_q))
    result = await db.execute(sibling_q)
    return result.scalars().all()


# ─── Parents ──────────────────────────────────────────────────────────────────

def _decrypt_parent_cnic(parent: models.Parent):
    """Decrypt the cnic on a Parent object without marking it as dirty."""
    if parent and parent.cnic:
        plain = decrypt_field(parent.cnic)
        set_committed_value(parent, 'cnic', plain)


async def get_parents(db: AsyncSession, skip: int = 0, limit: int = 50, search: str = None):
    q = select(models.Parent)
    if search:
        # Try to hash the search term for CNIC lookup
        search_hash = hash_for_dedup(search)
        pattern = f"%{search}%"
        q = q.where(
            models.Parent.guardian_name.ilike(pattern)
            | models.Parent.contact_no.ilike(pattern)
            | models.Parent.whatsapp_no.ilike(pattern)
            | models.Parent.cnic_hash == search_hash  # Exact match on CNIC hash
        )
    q = q.offset(skip).limit(limit).order_by(desc(models.Parent.created_at))
    result = await db.execute(q)
    parents = result.scalars().all()
    for p in parents:
        _decrypt_parent_cnic(p)
    return parents


async def get_parent(db: AsyncSession, parent_id: int):
    q = select(models.Parent).options(
        selectinload(models.Parent.student_links).selectinload(models.StudentParentRel.student)
    ).where(models.Parent.id == parent_id)
    result = await db.execute(q)
    parent = result.scalar_one_or_none()
    _decrypt_parent_cnic(parent)
    return parent


async def create_parent(db: AsyncSession, data: schemas.ParentCreate):
    cnic_hash = hash_for_dedup(data.cnic)
    existing = await db.execute(
        select(models.Parent).where(models.Parent.cnic_hash == cnic_hash)
    )
    if existing.scalar_one_or_none():
        raise ValueError("Parent with this CNIC already exists")

    parent = models.Parent(
        guardian_name=data.guardian_name,
        cnic=encrypt_field(data.cnic),
        cnic_hash=cnic_hash,
        contact_no=data.contact_no,
        whatsapp_no=data.whatsapp_no,
        address=data.address,
    )
    db.add(parent)
    await db.flush()
    await db.refresh(parent)
    plain = decrypt_field(parent.cnic)
    set_committed_value(parent, 'cnic', plain)
    return parent


async def update_parent(db: AsyncSession, parent_id: int, data: schemas.ParentUpdate):
    parent = await get_parent(db, parent_id)
    if not parent:
        return None
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(parent, field, value)
    await db.flush()
    parent = await get_parent(db, parent_id)
    return parent


async def delete_parent(db: AsyncSession, parent_id: int):
    """Delete a parent record."""
    parent = await get_parent(db, parent_id)
    if parent:
        await db.delete(parent)
        await db.flush()
    return parent


async def link_parent_to_student(db: AsyncSession, student_id: int, data: schemas.LinkParentToStudent):
    rel = models.StudentParentRel(
        student_id=student_id,
        parent_id=data.parent_id,
        relationship=data.relationship
    )
    db.add(rel)
    await db.flush()
    return rel


async def unlink_parent_from_student(db: AsyncSession, student_id: int, parent_id: int):
    q = select(models.StudentParentRel).where(
        and_(
            models.StudentParentRel.student_id == student_id,
            models.StudentParentRel.parent_id == parent_id
        )
    )
    result = await db.execute(q)
    rel = result.scalar_one_or_none()
    if rel:
        await db.delete(rel)
        await db.flush()
    return rel


# ─── Teachers ────────────────────────────────────────────────────────────────

async def get_teachers(db: AsyncSession, skip: int = 0, limit: int = 50, status: str = None, search: str = None):
    q = select(models.Teacher)
    if status:
        q = q.where(models.Teacher.status == status)
    if search:
        pattern = f"%{search}%"
        q = q.where(
            models.Teacher.first_name.ilike(pattern)
            | models.Teacher.last_name.ilike(pattern)
            | models.Teacher.subject.ilike(pattern)
            | models.Teacher.phone.ilike(pattern)
            | models.Teacher.email.ilike(pattern)
        )
    q = q.offset(skip).limit(limit).order_by(desc(models.Teacher.created_at))
    result = await db.execute(q)
    return result.scalars().all()


async def get_teacher(db: AsyncSession, teacher_id: int):
    q = select(models.Teacher).where(models.Teacher.id == teacher_id)
    result = await db.execute(q)
    return result.scalar_one_or_none()


async def create_teacher(db: AsyncSession, data: schemas.TeacherCreate):
    teacher = models.Teacher(**data.model_dump())
    db.add(teacher)
    await db.flush()
    await db.refresh(teacher)
    return teacher


async def update_teacher(db: AsyncSession, teacher_id: int, data: schemas.TeacherUpdate):
    teacher = await get_teacher(db, teacher_id)
    if not teacher:
        return None
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(teacher, field, value)
    await db.flush()
    return await get_teacher(db, teacher_id)


async def delete_teacher(db: AsyncSession, teacher_id: int):
    teacher = await get_teacher(db, teacher_id)
    if teacher:
        await db.delete(teacher)
        await db.flush()
    return teacher


# ─── Fee Types ────────────────────────────────────────────────────────────────

async def get_fee_types(db: AsyncSession):
    q = select(models.FeeType).options(
        selectinload(models.FeeType.class_overrides)
    ).order_by(models.FeeType.fee_name)
    result = await db.execute(q)
    return result.scalars().all()


async def get_fee_type(db: AsyncSession, fee_type_id: int):
    q = select(models.FeeType).options(
        selectinload(models.FeeType.class_overrides)
    ).where(models.FeeType.id == fee_type_id)
    result = await db.execute(q)
    return result.scalar_one_or_none()


async def create_fee_type(db: AsyncSession, data: schemas.FeeTypeCreate):
    fee = models.FeeType(**data.model_dump())
    db.add(fee)
    await db.flush()
    return await get_fee_type(db, fee.id)


async def update_fee_type(db: AsyncSession, fee_type_id: int, data: schemas.FeeTypeUpdate):
    fee = await get_fee_type(db, fee_type_id)
    if not fee:
        return None
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(fee, field, value)
    await db.flush()
    return fee


async def add_class_override(db: AsyncSession, fee_type_id: int, data: schemas.FeeClassOverrideCreate):
    override = models.FeeClassOverride(fee_type_id=fee_type_id, **data.model_dump())
    db.add(override)
    await db.flush()
    return override


async def delete_fee_type(db: AsyncSession, fee_type_id: int):
    """Delete a fee type (only if not used in any invoices)."""
    fee = await get_fee_type(db, fee_type_id)
    if fee:
        # Check if fee type is used in any invoice line items
        from sqlalchemy import select, func
        used_in_invoice = await db.execute(
            select(func.count(models.InvoiceLineItem.id)).where(
                models.InvoiceLineItem.fee_type_id == fee_type_id
            )
        )
        if used_in_invoice.scalar() > 0:
            raise ValueError("Cannot delete fee type that is used in existing invoices")
        await db.delete(fee)
        await db.flush()
    return fee


# ─── Invoices ─────────────────────────────────────────────────────────────────

def attach_invoice_financials(invoice: models.Invoice) -> dict:
    """Compute total_amount, amount_paid, balance_due from loaded relationships.
    (Renamed from _attach_invoice_financials to make it a proper public function.)
    """
    total = sum(item.amount for item in invoice.line_items)
    paid = sum(p.amount_paid for p in invoice.payments)
    balance = Decimal(str(total)) - Decimal(str(paid))
    return {"total_amount": total, "amount_paid": paid, "balance_due": balance}


async def get_invoices(db: AsyncSession, student_id: int = None, status: str = None,
                       skip: int = 0, limit: int = 50):
    q = select(models.Invoice).options(
        selectinload(models.Invoice.line_items).selectinload(models.InvoiceLineItem.fee_type),
        selectinload(models.Invoice.student),
        selectinload(models.Invoice.payments)
    )
    if student_id:
        q = q.where(models.Invoice.student_id == student_id)
    if status:
        q = q.where(models.Invoice.status == status)
    q = q.offset(skip).limit(limit).order_by(desc(models.Invoice.created_at))
    result = await db.execute(q)
    return result.scalars().all()


async def get_invoice(db: AsyncSession, invoice_id: int):
    q = select(models.Invoice).options(
        selectinload(models.Invoice.line_items).selectinload(models.InvoiceLineItem.fee_type),
        selectinload(models.Invoice.student),
        selectinload(models.Invoice.payments)
    ).where(models.Invoice.id == invoice_id)
    result = await db.execute(q)
    return result.scalar_one_or_none()


async def create_invoice(db: AsyncSession, data: schemas.InvoiceCreate):
    """Create an invoice + all line items atomically using a single flush."""
    line_items_data = data.line_items
    invoice_data = data.model_dump(exclude={"line_items"})
    invoice = models.Invoice(**invoice_data)
    db.add(invoice)
    # Add all line items to the session before flushing — single atomic operation
    line_item_objects = []
    for item in line_items_data:
        li = models.InvoiceLineItem(invoice_id=None, **item.model_dump())
        line_item_objects.append(li)
    await db.flush()  # get invoice.id
    for li in line_item_objects:
        li.invoice_id = invoice.id
        db.add(li)
    await db.flush()  # persist all line items
    return await get_invoice(db, invoice.id)


async def update_invoice_status(db: AsyncSession, invoice_id: int, status: schemas.InvoiceStatus):
    invoice = await get_invoice(db, invoice_id)
    if not invoice:
        return None
    invoice.status = status
    await db.flush()
    return invoice


async def delete_invoice(db: AsyncSession, invoice_id: int):
    """Delete an invoice (cascade deletes line items and payments)."""
    invoice = await get_invoice(db, invoice_id)
    if invoice:
        await db.delete(invoice)
        await db.flush()
    return invoice


# ─── Payments ─────────────────────────────────────────────────────────────────

async def get_payments(db: AsyncSession, invoice_id: int = None, skip: int = 0, limit: int = 50):
    q = select(models.Payment)
    if invoice_id:
        q = q.where(models.Payment.invoice_id == invoice_id)
    q = q.offset(skip).limit(limit).order_by(desc(models.Payment.payment_date))
    result = await db.execute(q)
    return result.scalars().all()


async def create_payment(db: AsyncSession, data: schemas.PaymentCreate):
    # Load invoice first to check the balance
    invoice = await get_invoice(db, data.invoice_id)
    if not invoice:
        raise ValueError("Invoice not found")

    financials = attach_invoice_financials(invoice)
    balance = Decimal(str(financials["balance_due"]))

    # ── Fix 7: Prevent overpayment ───────────────────────────────────────────
    if Decimal(str(data.amount_paid)) > balance:
        raise ValueError(
            f"Payment amount ({data.amount_paid}) exceeds outstanding balance ({balance})"
        )

    payment = models.Payment(**data.model_dump())
    db.add(payment)
    await db.flush()

    # Auto-update invoice status
    invoice = await get_invoice(db, data.invoice_id)
    if invoice:
        fin = attach_invoice_financials(invoice)
        total = Decimal(str(fin["total_amount"]))
        paid = Decimal(str(fin["amount_paid"]))
        if paid >= total:
            invoice.status = models.InvoiceStatus.PAID
        elif paid > 0:
            invoice.status = models.InvoiceStatus.PARTIAL
        await db.flush()

    await db.refresh(payment)
    return payment


async def delete_payment(db: AsyncSession, payment_id: int):
    """Void/delete a payment and recalculate invoice status."""
    q = select(models.Payment).where(models.Payment.id == payment_id)
    result = await db.execute(q)
    payment = result.scalar_one_or_none()
    if not payment:
        return None

    invoice_id = payment.invoice_id
    await db.delete(payment)
    await db.flush()

    # Recalculate invoice status after voiding payment
    invoice = await get_invoice(db, invoice_id)
    if invoice:
        fin = attach_invoice_financials(invoice)
        total = Decimal(str(fin["total_amount"]))
        paid = Decimal(str(fin["amount_paid"]))
        if paid <= 0:
            invoice.status = models.InvoiceStatus.PENDING
        elif paid < total:
            invoice.status = models.InvoiceStatus.PARTIAL
        await db.flush()

    return payment


# ─── Dashboard ────────────────────────────────────────────────────────────────

async def get_dashboard_stats(db: AsyncSession) -> schemas.DashboardStats:
    current_month = datetime.now().strftime("%Y-%m")

    total_students = (await db.execute(select(func.count(models.Student.id)))).scalar()
    active_students = (await db.execute(
        select(func.count(models.Student.id)).where(models.Student.status == "active")
    )).scalar()
    total_parents = (await db.execute(select(func.count(models.Parent.id)))).scalar()
    pending_invoices = (await db.execute(
        select(func.count(models.Invoice.id)).where(models.Invoice.status == "pending")
    )).scalar()
    overdue_invoices = (await db.execute(
        select(func.count(models.Invoice.id)).where(models.Invoice.status == "overdue")
    )).scalar()

    collected_q = select(func.coalesce(func.sum(models.Payment.amount_paid), 0)).join(
        models.Invoice, models.Payment.invoice_id == models.Invoice.id
    ).where(models.Invoice.billing_month == current_month)
    collected = (await db.execute(collected_q)).scalar()

    pending_total_q = select(
        func.coalesce(func.sum(models.InvoiceLineItem.amount), 0)
    ).join(
        models.Invoice, models.InvoiceLineItem.invoice_id == models.Invoice.id
    ).where(models.Invoice.status.in_(["pending", "partial", "overdue"]))
    pending_total = (await db.execute(pending_total_q)).scalar()

    paid_partial_q = select(
        func.coalesce(func.sum(models.Payment.amount_paid), 0)
    ).join(
        models.Invoice, models.Payment.invoice_id == models.Invoice.id
    ).where(models.Invoice.status.in_(["pending", "partial", "overdue"]))
    paid_partial = (await db.execute(paid_partial_q)).scalar()

    return schemas.DashboardStats(
        total_students=total_students,
        active_students=active_students,
        total_parents=total_parents,
        pending_invoices=pending_invoices,
        overdue_invoices=overdue_invoices,
        total_collected_this_month=Decimal(str(collected)),
        total_pending_amount=Decimal(str(pending_total)) - Decimal(str(paid_partial)),
    )


async def get_monthly_collections(db: AsyncSession, months: int = 6) -> list[schemas.MonthlyCollection]:
    """Return total payments collected per billing month for the last N months."""
    q = (
        select(
            models.Invoice.billing_month,
            func.coalesce(func.sum(models.Payment.amount_paid), 0).label("amount"),
        )
        .join(models.Payment, models.Payment.invoice_id == models.Invoice.id, isouter=True)
        .group_by(models.Invoice.billing_month)
        .order_by(models.Invoice.billing_month)
        .limit(months)
    )
    result = await db.execute(q)
    rows = result.all()
    return [schemas.MonthlyCollection(month=row.billing_month, amount=Decimal(str(row.amount))) for row in rows]
