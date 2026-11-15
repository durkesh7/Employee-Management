import re
from datetime import date, timedelta
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

PHONE_PATTERN = re.compile(r"^\+?[0-9]{10,15}$")
MIN_JOINING_DATE = date(1990, 1, 1)


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
