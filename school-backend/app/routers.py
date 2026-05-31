"""
FastAPI Routers — All API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app import crud, schemas

# ─── Students Router ──────────────────────────────────────────────────────────

students_router = APIRouter(prefix="/students", tags=["Students"])


@students_router.get("/", response_model=list[schemas.StudentOut])
async def list_students(
    skip: int = 0,
    limit: int = 100,
    status: str = Query(None, description="Filter by status: active, withdrawn, graduated"),
    db: AsyncSession = Depends(get_db)
):
    return await crud.get_students(db, skip=skip, limit=limit, status=status)


@students_router.post("/", response_model=schemas.StudentOut, status_code=201)
async def create_student(data: schemas.StudentCreate, db: AsyncSession = Depends(get_db)):
    return await crud.create_student(db, data)


@students_router.get("/{student_id}", response_model=schemas.StudentOut)
async def get_student(student_id: int, db: AsyncSession = Depends(get_db)):
    student = await crud.get_student(db, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


@students_router.patch("/{student_id}", response_model=schemas.StudentOut)
async def update_student(student_id: int, data: schemas.StudentUpdate, db: AsyncSession = Depends(get_db)):
    student = await crud.update_student(db, student_id, data)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


@students_router.delete("/{student_id}", status_code=204)
async def delete_student(student_id: int, db: AsyncSession = Depends(get_db)):
    student = await crud.delete_student(db, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")


@students_router.get("/{student_id}/siblings", response_model=list[schemas.StudentBrief])
async def get_siblings(student_id: int, db: AsyncSession = Depends(get_db)):
    return await crud.get_siblings(db, student_id)


@students_router.post("/{student_id}/parents", response_model=schemas.StudentParentRelOut, status_code=201)
async def link_parent(student_id: int, data: schemas.LinkParentToStudent, db: AsyncSession = Depends(get_db)):
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
async def unlink_parent(student_id: int, parent_id: int, db: AsyncSession = Depends(get_db)):
    rel = await crud.unlink_parent_from_student(db, student_id, parent_id)
    if not rel:
        raise HTTPException(status_code=404, detail="Link not found")


# ─── Parents Router ───────────────────────────────────────────────────────────

parents_router = APIRouter(prefix="/parents", tags=["Parents"])


@parents_router.get("/", response_model=list[schemas.ParentOut])
async def list_parents(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    return await crud.get_parents(db, skip=skip, limit=limit)


@parents_router.post("/", response_model=schemas.ParentOut, status_code=201)
async def create_parent(data: schemas.ParentCreate, db: AsyncSession = Depends(get_db)):
    return await crud.create_parent(db, data)


@parents_router.get("/{parent_id}", response_model=schemas.ParentOut)
async def get_parent(parent_id: int, db: AsyncSession = Depends(get_db)):
    parent = await crud.get_parent(db, parent_id)
    if not parent:
        raise HTTPException(status_code=404, detail="Parent not found")
    return parent


@parents_router.patch("/{parent_id}", response_model=schemas.ParentOut)
async def update_parent(parent_id: int, data: schemas.ParentUpdate, db: AsyncSession = Depends(get_db)):
    parent = await crud.update_parent(db, parent_id, data)
    if not parent:
        raise HTTPException(status_code=404, detail="Parent not found")
    return parent


# ─── Fees Router ──────────────────────────────────────────────────────────────

fees_router = APIRouter(prefix="/fees", tags=["Fee Types"])


@fees_router.get("/", response_model=list[schemas.FeeTypeOut])
async def list_fee_types(db: AsyncSession = Depends(get_db)):
    return await crud.get_fee_types(db)


@fees_router.post("/", response_model=schemas.FeeTypeOut, status_code=201)
async def create_fee_type(data: schemas.FeeTypeCreate, db: AsyncSession = Depends(get_db)):
    try:
        return await crud.create_fee_type(db, data)
    except Exception:
        raise HTTPException(status_code=409, detail="Fee type with this name already exists")


@fees_router.patch("/{fee_type_id}", response_model=schemas.FeeTypeOut)
async def update_fee_type(fee_type_id: int, data: schemas.FeeTypeUpdate, db: AsyncSession = Depends(get_db)):
    fee = await crud.update_fee_type(db, fee_type_id, data)
    if not fee:
        raise HTTPException(status_code=404, detail="Fee type not found")
    return fee


@fees_router.post("/{fee_type_id}/overrides", response_model=schemas.FeeClassOverrideOut, status_code=201)
async def add_class_override(
    fee_type_id: int, data: schemas.FeeClassOverrideCreate, db: AsyncSession = Depends(get_db)
):
    fee = await crud.get_fee_type(db, fee_type_id)
    if not fee:
        raise HTTPException(status_code=404, detail="Fee type not found")
    try:
        return await crud.add_class_override(db, fee_type_id, data)
    except Exception:
        raise HTTPException(status_code=409, detail="Override already exists for this class")


# ─── Invoices Router ──────────────────────────────────────────────────────────

invoices_router = APIRouter(prefix="/invoices", tags=["Invoices"])


@invoices_router.get("/", response_model=list[schemas.InvoiceOut])
async def list_invoices(
    student_id: int = None,
    status: str = Query(None, description="pending, partial, paid, overdue"),
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    invoices = await crud.get_invoices(db, student_id=student_id, status=status, skip=skip, limit=limit)
    result = []
    for inv in invoices:
        inv_dict = schemas.InvoiceOut.model_validate(inv).model_dump()
        financials = crud._attach_invoice_financials(inv)
        inv_dict.update(financials)
        result.append(inv_dict)
    return result


@invoices_router.post("/", response_model=schemas.InvoiceOut, status_code=201)
async def create_invoice(data: schemas.InvoiceCreate, db: AsyncSession = Depends(get_db)):
    student = await crud.get_student(db, data.student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    try:
        invoice = await crud.create_invoice(db, data)
        inv_dict = schemas.InvoiceOut.model_validate(invoice).model_dump()
        financials = crud._attach_invoice_financials(invoice)
        inv_dict.update(financials)
        return inv_dict
    except Exception as e:
        raise HTTPException(status_code=409, detail="Invoice for this student and month already exists")


@invoices_router.get("/{invoice_id}", response_model=schemas.InvoiceOut)
async def get_invoice(invoice_id: int, db: AsyncSession = Depends(get_db)):
    invoice = await crud.get_invoice(db, invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    inv_dict = schemas.InvoiceOut.model_validate(invoice).model_dump()
    financials = crud._attach_invoice_financials(invoice)
    inv_dict.update(financials)
    return inv_dict


@invoices_router.patch("/{invoice_id}/status", response_model=schemas.InvoiceOut)
async def update_invoice_status(
    invoice_id: int, data: schemas.InvoiceStatusUpdate, db: AsyncSession = Depends(get_db)
):
    invoice = await crud.update_invoice_status(db, invoice_id, data.status)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return invoice


# ─── Payments Router ──────────────────────────────────────────────────────────

payments_router = APIRouter(prefix="/payments", tags=["Payments"])


@payments_router.get("/", response_model=list[schemas.PaymentOut])
async def list_payments(
    invoice_id: int = None,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    return await crud.get_payments(db, invoice_id=invoice_id, skip=skip, limit=limit)


@payments_router.post("/", response_model=schemas.PaymentOut, status_code=201)
async def create_payment(data: schemas.PaymentCreate, db: AsyncSession = Depends(get_db)):
    invoice = await crud.get_invoice(db, data.invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return await crud.create_payment(db, data)


# ─── Dashboard Router ─────────────────────────────────────────────────────────

dashboard_router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@dashboard_router.get("/stats", response_model=schemas.DashboardStats)
async def get_dashboard_stats(db: AsyncSession = Depends(get_db)):
    return await crud.get_dashboard_stats(db)
