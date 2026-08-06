"""
FastAPI Routers — All API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.config import settings

from app.database import get_db
from app import crud, schemas
from app.auth import (
    create_access_token, create_refresh_token, decode_token, revoke_token,
    get_current_user, verify_password,
)
from app.models import User

# Shared limiter — same instance as in main.py (accessed via app.state.limiter)
limiter = Limiter(key_func=get_remote_address)


# ─── Auth Router ───────────────────────────────────────────────────────────────

auth_router = APIRouter(prefix="/auth", tags=["Authentication"])


@auth_router.post("/login", response_model=schemas.TokenPair)
@limiter.limit("5/minute")
async def login(request: Request, response: Response, data: schemas.LoginRequest, db: AsyncSession = Depends(get_db)):
    """Login — rate limited to 5 attempts per minute per IP."""
    user = await crud.get_user_by_username(db, data.username)
    if not user or not user.is_active or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )
    access_token = create_access_token(data={"sub": user.username})
    refresh_token = create_refresh_token(data={"sub": user.username})
    
    response.set_cookie(key="access_token", value=access_token, httponly=True, max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60, samesite="lax")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400, samesite="lax")
    
    return schemas.TokenPair(access_token=access_token, refresh_token=refresh_token)


@auth_router.post("/refresh", response_model=schemas.Token)
async def refresh_token(request: Request, response: Response, db: AsyncSession = Depends(get_db)):
    """Exchange a valid refresh token for a new access token."""
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing refresh token",
        )
    payload = await decode_token(refresh_token, expected_type="refresh", db=db)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )
    username = payload.get("sub")
    user = await crud.get_user_by_username(db, username)
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")
    access_token = create_access_token(data={"sub": user.username})
    
    response.set_cookie(key="access_token", value=access_token, httponly=True, max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60, samesite="lax")
    
    return schemas.Token(access_token=access_token)


@auth_router.post("/logout", status_code=204)
async def logout(request: Request, response: Response, db: AsyncSession = Depends(get_db)):
    """Invalidate a refresh token (adds it to the revocation list)."""
    refresh_token = request.cookies.get("refresh_token")
    if refresh_token:
        await revoke_token(refresh_token, db)
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")


@auth_router.get("/me", response_model=schemas.UserOut)
async def me(current_user: User = Depends(get_current_user)):
    return current_user


@auth_router.patch("/me/profile", response_model=schemas.UserOut)
async def update_my_profile(
    data: schemas.UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update own profile (full_name, email)."""
    try:
        user = await crud.update_user_profile(db, current_user.id, data)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))


# ─── Students Router ──────────────────────────────────────────────────────────

students_router = APIRouter(prefix="/students", tags=["Students"])


@students_router.get("/", response_model=list[schemas.StudentOut])
async def list_students(
    skip: int = 0,
    limit: int = Query(50, le=200),
    status: str = Query(None, description="Filter by status: active, withdrawn, graduated"),
    search: str = Query(None, description="Search by name or class"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return await crud.get_students(db, skip=skip, limit=limit, status=status, search=search)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))


@students_router.post("/", response_model=schemas.StudentOut, status_code=201)
async def create_student(
    data: schemas.StudentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return await crud.create_student(db, data)
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))


@students_router.get("/{student_id}", response_model=schemas.StudentWithParents)
async def get_student(
    student_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    student = await crud.get_student(db, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


@students_router.patch("/{student_id}", response_model=schemas.StudentOut)
async def update_student(
    student_id: int,
    data: schemas.StudentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        student = await crud.update_student(db, student_id, data)
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        return student
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))


@students_router.delete("/{student_id}", status_code=204)
async def delete_student(
    student_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    student = await crud.delete_student(db, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")


@students_router.get("/{student_id}/siblings", response_model=list[schemas.StudentBrief])
async def get_siblings(
    student_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await crud.get_siblings(db, student_id)


@students_router.post("/{student_id}/parents", response_model=schemas.StudentParentRelOut, status_code=201)
async def link_parent(
    student_id: int,
    data: schemas.LinkParentToStudent,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    student = await crud.get_student(db, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    parent = await crud.get_parent(db, data.parent_id)
    if not parent:
        raise HTTPException(status_code=404, detail="Parent not found")
    try:
        return await crud.link_parent_to_student(db, student_id, data)
    except Exception:
        raise HTTPException(status_code=409, detail="Parent already linked to this student")


@students_router.delete("/{student_id}/parents/{parent_id}", status_code=204)
async def unlink_parent(
    student_id: int,
    parent_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rel = await crud.unlink_parent_from_student(db, student_id, parent_id)
    if not rel:
        raise HTTPException(status_code=404, detail="Link not found")


# ─── Parents Router ───────────────────────────────────────────────────────────

parents_router = APIRouter(prefix="/parents", tags=["Parents"])


@parents_router.get("/", response_model=list[schemas.ParentOut])
async def list_parents(
    skip: int = 0,
    limit: int = Query(50, le=200),
    search: str = Query(None, description="Search by guardian name, CNIC, or phone number"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await crud.get_parents(db, skip=skip, limit=limit, search=search)


@parents_router.post("/", response_model=schemas.ParentOut, status_code=201)
async def create_parent(
    data: schemas.ParentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return await crud.create_parent(db, data)
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))


@parents_router.get("/{parent_id}", response_model=schemas.ParentWithStudents)
async def get_parent(
    parent_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    parent = await crud.get_parent(db, parent_id)
    if not parent:
        raise HTTPException(status_code=404, detail="Parent not found")
    return parent


@parents_router.patch("/{parent_id}", response_model=schemas.ParentOut)
async def update_parent(
    parent_id: int,
    data: schemas.ParentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        parent = await crud.update_parent(db, parent_id, data)
        if not parent:
            raise HTTPException(status_code=404, detail="Parent not found")
        return parent
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))


@parents_router.delete("/{parent_id}", status_code=204)
async def delete_parent(
    parent_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a parent (only if not linked to any active students)."""
    parent = await crud.delete_parent(db, parent_id)
    if not parent:
        raise HTTPException(status_code=404, detail="Parent not found")


# ─── Teachers Router ──────────────────────────────────────────────────────────

teachers_router = APIRouter(prefix="/teachers", tags=["Teachers"])


@teachers_router.get("/", response_model=list[schemas.TeacherOut])
async def list_teachers(
    skip: int = 0,
    limit: int = Query(50, le=200),
    status: str = Query(None, description="Filter by status: active, inactive, resigned"),
    search: str = Query(None, description="Search by name, subject, phone, or email"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return await crud.get_teachers(db, skip=skip, limit=limit, status=status, search=search)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))


@teachers_router.post("/", response_model=schemas.TeacherOut, status_code=201)
async def create_teacher(
    data: schemas.TeacherCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await crud.create_teacher(db, data)


@teachers_router.get("/{teacher_id}", response_model=schemas.TeacherOut)
async def get_teacher(
    teacher_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    teacher = await crud.get_teacher(db, teacher_id)
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    return teacher


@teachers_router.patch("/{teacher_id}", response_model=schemas.TeacherOut)
async def update_teacher(
    teacher_id: int,
    data: schemas.TeacherUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    teacher = await crud.update_teacher(db, teacher_id, data)
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    return teacher


@teachers_router.delete("/{teacher_id}", status_code=204)
async def delete_teacher(
    teacher_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    teacher = await crud.delete_teacher(db, teacher_id)
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")


# ─── Fees Router ──────────────────────────────────────────────────────────────

fees_router = APIRouter(prefix="/fees", tags=["Fee Types"])


@fees_router.get("/", response_model=list[schemas.FeeTypeOut])
async def list_fee_types(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await crud.get_fee_types(db)


@fees_router.post("/", response_model=schemas.FeeTypeOut, status_code=201)
async def create_fee_type(
    data: schemas.FeeTypeCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return await crud.create_fee_type(db, data)
    except Exception:
        raise HTTPException(status_code=409, detail="Fee type with this name already exists")


@fees_router.patch("/{fee_type_id}", response_model=schemas.FeeTypeOut)
async def update_fee_type(
    fee_type_id: int,
    data: schemas.FeeTypeUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    fee = await crud.update_fee_type(db, fee_type_id, data)
    if not fee:
        raise HTTPException(status_code=404, detail="Fee type not found")
    return fee


@fees_router.post("/{fee_type_id}/overrides", response_model=schemas.FeeClassOverrideOut, status_code=201)
async def add_class_override(
    fee_type_id: int,
    data: schemas.FeeClassOverrideCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    fee = await crud.get_fee_type(db, fee_type_id)
    if not fee:
        raise HTTPException(status_code=404, detail="Fee type not found")
    try:
        return await crud.add_class_override(db, fee_type_id, data)
    except Exception:
        raise HTTPException(status_code=409, detail="Override already exists for this class")


@fees_router.delete("/{fee_type_id}", status_code=204)
async def delete_fee_type(
    fee_type_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Delete a fee type (only if not used in any invoices)."""
    fee = await crud.delete_fee_type(db, fee_type_id)
    if not fee:
        raise HTTPException(status_code=404, detail="Fee type not found")


# ─── Invoices Router ──────────────────────────────────────────────────────────

invoices_router = APIRouter(prefix="/invoices", tags=["Invoices"])


@invoices_router.get("/", response_model=list[schemas.InvoiceOut])
async def list_invoices(
    student_id: int = None,
    status: str = Query(None, description="pending, partial, paid, overdue"),
    skip: int = 0,
    limit: int = Query(50, le=200),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        invoices = await crud.get_invoices(db, student_id=student_id, status=status, skip=skip, limit=limit)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    result = []
    for inv in invoices:
        inv_dict = schemas.InvoiceOut.model_validate(inv).model_dump()
        financials = crud.attach_invoice_financials(inv)
        inv_dict.update(financials)
        result.append(inv_dict)
    return result


@invoices_router.post("/", response_model=schemas.InvoiceOut, status_code=201)
async def create_invoice(
    data: schemas.InvoiceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    student = await crud.get_student(db, data.student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    # Proactive duplicate check
    existing = await crud.get_invoice_by_student_month(db, data.student_id, data.billing_month)
    if existing:
        raise HTTPException(status_code=409, detail="Invoice for this student and month already exists")
    try:
        invoice = await crud.create_invoice(db, data)
        inv_dict = schemas.InvoiceOut.model_validate(invoice).model_dump()
        financials = crud.attach_invoice_financials(invoice)
        inv_dict.update(financials)
        return inv_dict
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except IntegrityError:
        raise HTTPException(status_code=409, detail="Invoice for this student and month already exists")


@invoices_router.get("/{invoice_id}", response_model=schemas.InvoiceOut)
async def get_invoice(
    invoice_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    invoice = await crud.get_invoice(db, invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    inv_dict = schemas.InvoiceOut.model_validate(invoice).model_dump()
    financials = crud.attach_invoice_financials(invoice)
    inv_dict.update(financials)
    return inv_dict


@invoices_router.patch("/{invoice_id}/status", response_model=schemas.InvoiceOut)
async def update_invoice_status(
    invoice_id: int,
    data: schemas.InvoiceStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    invoice = await crud.update_invoice_status(db, invoice_id, data.status)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return invoice


@invoices_router.delete("/{invoice_id}", status_code=204)
async def delete_invoice(
    invoice_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete an invoice (blocked while it has non-voided payments)."""
    try:
        invoice = await crud.delete_invoice(db, invoice_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")


# ─── Payments Router ──────────────────────────────────────────────────────────

payments_router = APIRouter(prefix="/payments", tags=["Payments"])


@payments_router.get("/", response_model=list[schemas.PaymentOut])
async def list_payments(
    invoice_id: int = None,
    skip: int = 0,
    limit: int = Query(50, le=200),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await crud.get_payments(db, invoice_id=invoice_id, skip=skip, limit=limit)


@payments_router.post("/", response_model=schemas.PaymentOut, status_code=201)
async def create_payment(
    data: schemas.PaymentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    invoice = await crud.get_invoice(db, data.invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    try:
        return await crud.create_payment(db, data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@payments_router.delete("/{payment_id}", status_code=204)
async def delete_payment(
    payment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Void a payment (soft delete — recalculates invoice status automatically)."""
    payment = await crud.delete_payment(db, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")


# ─── Dashboard Router ─────────────────────────────────────────────────────────

dashboard_router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@dashboard_router.get("/stats", response_model=schemas.DashboardStats)
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await crud.get_dashboard_stats(db)


@dashboard_router.get("/monthly-collections", response_model=list[schemas.MonthlyCollection])
async def get_monthly_collections(
    months: int = Query(6, ge=1, le=24, description="Number of past months to return"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Real monthly collections data for the dashboard chart."""
    return await crud.get_monthly_collections(db, months=months)
