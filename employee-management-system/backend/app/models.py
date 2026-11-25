from datetime import date, datetime
<<<<<<< HEAD
from decimal import Decimal

from sqlalchemy import CheckConstraint, Date, DateTime, ForeignKey, Numeric, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
=======

from sqlalchemy import CheckConstraint, Date, DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column
>>>>>>> 2ab088867014c71a7eb167d4554fb79a90cdfac9

from .database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(100), default="Admin")
    password_hash: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Employee(Base):
    __tablename__ = "employees"
    __table_args__ = (CheckConstraint("status IN ('Active', 'Inactive')", name="ck_employees_status"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    phone: Mapped[str] = mapped_column(String(20))
    department: Mapped[str] = mapped_column(String(60), index=True)
    designation: Mapped[str] = mapped_column(String(60))
    joining_date: Mapped[date] = mapped_column(Date)
    status: Mapped[str] = mapped_column(String(10), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
<<<<<<< HEAD
    salaries: Mapped[list["SalaryDetail"]] = relationship(
        back_populates="employee", cascade="all, delete-orphan"
    )


class SalaryDetail(Base):
    __tablename__ = "salary_details"
    __table_args__ = (UniqueConstraint("employee_id", "salary_month", name="uq_salary_employee_month"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    employee_id: Mapped[int] = mapped_column(ForeignKey("employees.id", ondelete="CASCADE"), index=True)
    salary_month: Mapped[str] = mapped_column(String(7), index=True)  # "YYYY-MM"
    basic_salary: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    hra: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    allowances: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    deductions: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    net_salary: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    employee: Mapped["Employee"] = relationship(back_populates="salaries", lazy="joined")

    @property
    def employee_name(self) -> str:
        return self.employee.name

    @property
    def employee_department(self) -> str:
        return self.employee.department


class Student(Base):
    __tablename__ = "students"

    id: Mapped[int] = mapped_column(primary_key=True)
    student_name: Mapped[str] = mapped_column(String(100), index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    phone: Mapped[str] = mapped_column(String(20))
    gender: Mapped[str] = mapped_column(String(20))
    date_of_birth: Mapped[date] = mapped_column(Date)
    department: Mapped[str] = mapped_column(String(60), index=True)
    course: Mapped[str] = mapped_column(String(100))
    year_of_study: Mapped[int] = mapped_column()
    address: Mapped[str] = mapped_column(String(255))
    admission_date: Mapped[date] = mapped_column(Date)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
=======
>>>>>>> 2ab088867014c71a7eb167d4554fb79a90cdfac9
