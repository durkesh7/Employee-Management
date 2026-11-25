from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user
from ..models import Student
from ..schemas import StudentIn, StudentOut

router = APIRouter(prefix="/students", tags=["Students"], dependencies=[Depends(get_current_user)])


@router.get("", response_model=list[StudentOut])
def list_students(db: Session = Depends(get_db)):
    return list(db.scalars(select(Student).order_by(Student.id.desc())).all())


@router.post("", response_model=StudentOut, status_code=status.HTTP_201_CREATED)
def create_student(payload: StudentIn, db: Session = Depends(get_db)):
    if db.scalar(select(Student.id).where(Student.email == payload.email)):
        raise HTTPException(status.HTTP_409_CONFLICT, "A student with this email already exists")
    student = Student(**payload.model_dump())
    db.add(student)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT, "A student with this email already exists")
    db.refresh(student)
    return student


@router.get("/{student_id}", response_model=StudentOut)
def get_student(student_id: int, db: Session = Depends(get_db)):
    student = db.get(Student, student_id)
    if not student:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Student not found")
    return student


@router.put("/{student_id}", response_model=StudentOut)
def update_student(student_id: int, payload: StudentIn, db: Session = Depends(get_db)):
    student = db.get(Student, student_id)
    if not student:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Student not found")
    duplicate = db.scalar(select(Student.id).where(Student.email == payload.email, Student.id != student_id))
    if duplicate:
        raise HTTPException(status.HTTP_409_CONFLICT, "A student with this email already exists")
    for field, value in payload.model_dump().items():
        setattr(student, field, value)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT, "A student with this email already exists")
    db.refresh(student)
    return student


@router.delete("/{student_id}")
def delete_student(student_id: int, db: Session = Depends(get_db)):
    student = db.get(Student, student_id)
    if not student:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Student not found")
    db.delete(student)
    db.commit()
    return {"message": "Student deleted successfully"}
