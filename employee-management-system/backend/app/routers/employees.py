import math
from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user
from ..models import Employee
from ..schemas import EmployeeIn, EmployeeOut, EmployeePage, EmployeeStats

router = APIRouter(prefix="/employees", tags=["Employees"], dependencies=[Depends(get_current_user)])

NOT_FOUND = "Employee not found"
DUPLICATE_EMAIL = "An employee with this email already exists"
MAX_INT4 = 2_147_483_647


def parse_employee_id(employee_id: str) -> int:
    if not employee_id.isdigit() or not 0 < int(employee_id) <= MAX_INT4:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid employee ID")
    return int(employee_id)


def escape_like(value: str) -> str:
    """Escape LIKE wildcards so user input is matched literally."""
    return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


def email_taken(db: Session, email: str, exclude_id: int | None = None) -> bool:
    stmt = select(Employee.id).where(Employee.email == email)
    if exclude_id is not None:
        stmt = stmt.where(Employee.id != exclude_id)
    return db.scalar(stmt) is not None


@router.get("/stats", response_model=EmployeeStats)
def get_stats(db: Session = Depends(get_db)):
    counts = dict(db.execute(select(Employee.status, func.count()).group_by(Employee.status)).all())
    active, inactive = counts.get("Active", 0), counts.get("Inactive", 0)
    return EmployeeStats(total=active + inactive, active=active, inactive=inactive)


@router.get("/departments", response_model=list[str])
def list_departments(db: Session = Depends(get_db)):
    return list(db.scalars(select(Employee.department).distinct().order_by(Employee.department)))


@router.get("", response_model=EmployeePage)
def list_employees(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None, max_length=100),
    department: Optional[str] = Query(None, max_length=60),
    status_filter: Optional[Literal["Active", "Inactive"]] = Query(None, alias="status"),
    db: Session = Depends(get_db),
):
    filters = []
    if search and search.strip():
        pattern = f"%{escape_like(search.strip())}%"
        filters.append(
            or_(Employee.name.ilike(pattern, escape="\\"), Employee.email.ilike(pattern, escape="\\"))
        )
    if department:
        filters.append(Employee.department == department)
    if status_filter:
        filters.append(Employee.status == status_filter)

    total = db.scalar(select(func.count()).select_from(Employee).where(*filters)) or 0
    rows = db.scalars(
        select(Employee).where(*filters).order_by(Employee.id.desc()).offset((page - 1) * limit).limit(limit)
    ).all()
    return EmployeePage(
        items=[EmployeeOut.model_validate(r) for r in rows],
        total=total,
        page=page,
        limit=limit,
        pages=max(1, math.ceil(total / limit)),
    )


@router.get("/{employee_id}", response_model=EmployeeOut)
def get_employee(employee_id: str, db: Session = Depends(get_db)):
    employee = db.get(Employee, parse_employee_id(employee_id))
    if not employee:
        raise HTTPException(status.HTTP_404_NOT_FOUND, NOT_FOUND)
    return employee


@router.post("", response_model=EmployeeOut, status_code=status.HTTP_201_CREATED)
def create_employee(payload: EmployeeIn, db: Session = Depends(get_db)):
    if email_taken(db, payload.email):
        raise HTTPException(status.HTTP_409_CONFLICT, DUPLICATE_EMAIL)
    employee = Employee(**payload.model_dump())
    db.add(employee)
    try:
        db.commit()
    except IntegrityError:  # race condition: another request inserted the same email
        db.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT, DUPLICATE_EMAIL)
    db.refresh(employee)
    return employee


@router.put("/{employee_id}", response_model=EmployeeOut)
def update_employee(employee_id: str, payload: EmployeeIn, db: Session = Depends(get_db)):
    emp_id = parse_employee_id(employee_id)
    employee = db.get(Employee, emp_id)
    if not employee:
        raise HTTPException(status.HTTP_404_NOT_FOUND, NOT_FOUND)
    if email_taken(db, payload.email, exclude_id=emp_id):
        raise HTTPException(status.HTTP_409_CONFLICT, DUPLICATE_EMAIL)
    for field, value in payload.model_dump().items():
        setattr(employee, field, value)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT, DUPLICATE_EMAIL)
    db.refresh(employee)
    return employee


@router.delete("/{employee_id}")
def delete_employee(employee_id: str, db: Session = Depends(get_db)):
    employee = db.get(Employee, parse_employee_id(employee_id))
    if not employee:
        raise HTTPException(status.HTTP_404_NOT_FOUND, NOT_FOUND)
    db.delete(employee)
    db.commit()
    return {"message": "Employee deleted successfully"}
