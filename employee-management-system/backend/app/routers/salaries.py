from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user
from ..models import Employee, SalaryDetail
from ..schemas import SalaryIn, SalaryOut

router = APIRouter(prefix="/salaries", tags=["Salary Details"], dependencies=[Depends(get_current_user)])

NOT_FOUND = "Salary record not found"
EMPLOYEE_NOT_FOUND = "Employee not found"
DUPLICATE = "Salary for this employee and month already exists"


def month_taken(db: Session, employee_id: int, month: str, exclude_id: int | None = None) -> bool:
    stmt = select(SalaryDetail.id).where(SalaryDetail.employee_id == employee_id, SalaryDetail.salary_month == month)
    if exclude_id is not None:
        stmt = stmt.where(SalaryDetail.id != exclude_id)
    return db.scalar(stmt) is not None


@router.get("", response_model=list[SalaryOut])
def list_salaries(
    employee_id: Optional[int] = Query(None, ge=1),
    month: Optional[str] = Query(None, pattern=r"^\d{4}-(0[1-9]|1[0-2])$"),
    db: Session = Depends(get_db),
):
    stmt = select(SalaryDetail).order_by(SalaryDetail.salary_month.desc(), SalaryDetail.id.desc())
    if employee_id:
        stmt = stmt.where(SalaryDetail.employee_id == employee_id)
    if month:
        stmt = stmt.where(SalaryDetail.salary_month == month)
    return list(db.scalars(stmt).unique().all())


@router.post("", response_model=SalaryOut, status_code=status.HTTP_201_CREATED)
def create_salary(payload: SalaryIn, db: Session = Depends(get_db)):
    """INSERT a new salary record. net_salary is always calculated on the server."""
    if not db.get(Employee, payload.employee_id):
        raise HTTPException(status.HTTP_404_NOT_FOUND, EMPLOYEE_NOT_FOUND)
    if month_taken(db, payload.employee_id, payload.salary_month):
        raise HTTPException(status.HTTP_409_CONFLICT, DUPLICATE)
    salary = SalaryDetail(**payload.model_dump(), net_salary=payload.net_salary)
    db.add(salary)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT, DUPLICATE)
    db.refresh(salary)
    return salary


@router.get("/{salary_id}", response_model=SalaryOut)
def get_salary(salary_id: int, db: Session = Depends(get_db)):
    salary = db.get(SalaryDetail, salary_id)
    if not salary:
        raise HTTPException(status.HTTP_404_NOT_FOUND, NOT_FOUND)
    return salary


@router.put("/{salary_id}", response_model=SalaryOut)
def update_salary(salary_id: int, payload: SalaryIn, db: Session = Depends(get_db)):
    salary = db.get(SalaryDetail, salary_id)
    if not salary:
        raise HTTPException(status.HTTP_404_NOT_FOUND, NOT_FOUND)
    if not db.get(Employee, payload.employee_id):
        raise HTTPException(status.HTTP_404_NOT_FOUND, EMPLOYEE_NOT_FOUND)
    if month_taken(db, payload.employee_id, payload.salary_month, exclude_id=salary_id):
        raise HTTPException(status.HTTP_409_CONFLICT, DUPLICATE)
    for field, value in payload.model_dump().items():
        setattr(salary, field, value)
    salary.net_salary = payload.net_salary
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT, DUPLICATE)
    db.refresh(salary)
    return salary


@router.delete("/{salary_id}")
def delete_salary(salary_id: int, db: Session = Depends(get_db)):
    salary = db.get(SalaryDetail, salary_id)
    if not salary:
        raise HTTPException(status.HTTP_404_NOT_FOUND, NOT_FOUND)
    db.delete(salary)
    db.commit()
    return {"message": "Salary record deleted successfully"}
