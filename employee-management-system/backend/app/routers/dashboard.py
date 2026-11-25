from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user
from ..models import Employee, SalaryDetail, Student

router = APIRouter(prefix="/dashboard", tags=["Dashboard"], dependencies=[Depends(get_current_user)])


@router.get("/summary")
def summary(db: Session = Depends(get_db)):
    status_counts = dict(db.execute(select(Employee.status, func.count()).group_by(Employee.status)).all())
    active, inactive = status_counts.get("Active", 0), status_counts.get("Inactive", 0)

    departments = [
        {"name": name, "count": count}
        for name, count in db.execute(
            select(Employee.department, func.count()).group_by(Employee.department).order_by(func.count().desc())
        ).all()
    ]

    recent = db.scalars(select(Employee).order_by(Employee.joining_date.desc(), Employee.id.desc()).limit(5)).all()

    trend_rows = db.execute(
        select(SalaryDetail.salary_month, func.sum(SalaryDetail.net_salary))
        .group_by(SalaryDetail.salary_month)
        .order_by(SalaryDetail.salary_month.desc())
        .limit(6)
    ).all()
    payroll_trend = [{"month": m, "total": float(t or 0)} for m, t in reversed(trend_rows)]

    return {
        "employees": {"total": active + inactive, "active": active, "inactive": inactive},
        "students": db.scalar(select(func.count()).select_from(Student)) or 0,
        "salary_records": db.scalar(select(func.count()).select_from(SalaryDetail)) or 0,
        "latest_payroll": payroll_trend[-1] if payroll_trend else None,
        "departments": departments,
        "payroll_trend": payroll_trend,
        "recent_hires": [
            {
                "id": e.id,
                "name": e.name,
                "department": e.department,
                "designation": e.designation,
                "joining_date": e.joining_date.isoformat(),
                "status": e.status,
            }
            for e in recent
        ],
    }
