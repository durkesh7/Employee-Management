import re
from datetime import date, timedelta
<<<<<<< HEAD
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator

PHONE_PATTERN = re.compile(r"^\+?[0-9]{10,15}$")
MIN_JOINING_DATE = date(1990, 1, 1)
MONTH_PATTERN = re.compile(r"^\d{4}-(0[1-9]|1[0-2])$")
=======
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

PHONE_PATTERN = re.compile(r"^\+?[0-9]{10,15}$")
MIN_JOINING_DATE = date(1990, 1, 1)
>>>>>>> 2ab088867014c71a7eb167d4554fb79a90cdfac9


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1, max_length=128)


class UserOut(BaseModel):
    email: str
    name: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class EmployeeIn(BaseModel):
    """Input model - all validation rules live here."""

    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str
    department: str = Field(..., min_length=2, max_length=60)
    designation: str = Field(..., min_length=2, max_length=60)
    joining_date: date
    status: Literal["Active", "Inactive"]

    @field_validator("name", "department", "designation", mode="before")
    @classmethod
    def strip_text(cls, value):
        return value.strip() if isinstance(value, str) else value

    @field_validator("email")
    @classmethod
    def normalise_email(cls, value: str) -> str:
        return value.lower()

    @field_validator("phone", mode="before")
    @classmethod
    def validate_phone(cls, value):
        if not isinstance(value, str):
            raise ValueError("Phone must be a string")
        cleaned = re.sub(r"[\s\-()]", "", value)
        if not PHONE_PATTERN.match(cleaned):
            raise ValueError("Phone must contain 10-15 digits, optionally starting with +")
        return cleaned

    @field_validator("joining_date")
    @classmethod
    def validate_joining_date(cls, value: date) -> date:
        if value < MIN_JOINING_DATE:
            raise ValueError("Joining date cannot be before 1990-01-01")
        if value > date.today() + timedelta(days=365):
            raise ValueError("Joining date cannot be more than one year in the future")
        return value


class EmployeeOut(BaseModel):
    """Output model - plain types, so older rows in the database never break a response."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    phone: str
    department: str
    designation: str
    joining_date: date
    status: str


class EmployeePage(BaseModel):
    items: list[EmployeeOut]
    total: int
    page: int
    limit: int
    pages: int


class EmployeeStats(BaseModel):
    total: int
    active: int
    inactive: int
<<<<<<< HEAD


class StudentIn(BaseModel):
    student_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str
    gender: Literal["Male", "Female", "Other"]
    date_of_birth: date
    department: str = Field(..., min_length=2, max_length=60)
    course: str = Field(..., min_length=2, max_length=100)
    year_of_study: int = Field(..., ge=1, le=10)
    address: str = Field(..., min_length=3, max_length=255)
    admission_date: date

    @field_validator("student_name", "department", "course", "address", mode="before")
    @classmethod
    def strip_student_text(cls, value):
        return value.strip() if isinstance(value, str) else value

    @field_validator("email")
    @classmethod
    def normalise_student_email(cls, value: str) -> str:
        return value.lower()

    @field_validator("phone", mode="before")
    @classmethod
    def validate_student_phone(cls, value):
        if not isinstance(value, str):
            raise ValueError("Phone must be a string")
        cleaned = re.sub(r"[\s\-()]", "", value)
        if not PHONE_PATTERN.match(cleaned):
            raise ValueError("Phone must contain 10-15 digits, optionally starting with +")
        return cleaned


class StudentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    student_name: str
    email: str
    phone: str
    gender: str
    date_of_birth: date
    department: str
    course: str
    year_of_study: int
    address: str
    admission_date: date


# ---------------------------------------------------------------- Salary details


class SalaryIn(BaseModel):
    employee_id: int = Field(..., ge=1)
    salary_month: str
    basic_salary: Decimal = Field(..., gt=0, max_digits=12, decimal_places=2)
    hra: Decimal = Field(Decimal("0"), ge=0, max_digits=12, decimal_places=2)
    allowances: Decimal = Field(Decimal("0"), ge=0, max_digits=12, decimal_places=2)
    deductions: Decimal = Field(Decimal("0"), ge=0, max_digits=12, decimal_places=2)

    @field_validator("salary_month", mode="before")
    @classmethod
    def validate_month(cls, value):
        if not isinstance(value, str) or not MONTH_PATTERN.match(value.strip()):
            raise ValueError("Month must be in YYYY-MM format")
        return value.strip()

    @model_validator(mode="after")
    def deductions_not_above_earnings(self):
        if self.deductions > self.basic_salary + self.hra + self.allowances:
            raise ValueError("Deductions cannot be more than total earnings")
        return self

    @property
    def net_salary(self) -> Decimal:
        return self.basic_salary + self.hra + self.allowances - self.deductions


class SalaryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    employee_id: int
    employee_name: str
    employee_department: str
    salary_month: str
    basic_salary: float
    hra: float
    allowances: float
    deductions: float
    net_salary: float
=======
>>>>>>> 2ab088867014c71a7eb167d4554fb79a90cdfac9
