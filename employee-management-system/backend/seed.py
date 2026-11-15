"""Optional: insert sample employees for demo purposes.  Usage (from the backend folder): python seed.py"""
import random
from datetime import date, timedelta

from sqlalchemy.exc import IntegrityError

from app.database import Base, SessionLocal, engine
from app.models import Employee

FIRST = ["John", "Priya", "Arun", "Meena", "Karthik", "Sara", "David", "Anitha", "Ravi", "Lakshmi",
         "Michael", "Divya", "Suresh", "Emma", "Vikram"]
LAST = ["Kumar", "Sharma", "Raj", "Iyer", "Smith", "Johnson", "Nair", "Reddy", "Patel", "Das"]
DEPTS = ["Engineering", "IT", "HR", "Finance", "Marketing", "Sales", "Operations"]
ROLES = ["Developer", "Analyst", "Manager", "Executive", "Lead", "Associate"]


def main() -> None:
    Base.metadata.create_all(bind=engine)
    inserted = 0
    with SessionLocal() as db:
        for i in range(25):
            name = f"{random.choice(FIRST)} {random.choice(LAST)}"
            employee = Employee(
                name=name,
                email=f"{name.lower().replace(' ', '.')}{i}@company.com",
                phone=f"9{random.randint(100000000, 999999999)}",
                department=random.choice(DEPTS),
                designation=random.choice(ROLES),
                joining_date=date(2020, 1, 1) + timedelta(days=random.randint(0, 1800)),
                status=random.choice(["Active", "Active", "Inactive"]),
            )
            db.add(employee)
            try:
                db.commit()
                inserted += 1
            except IntegrityError:
                db.rollback()
    print(f"Inserted {inserted} employees")


if __name__ == "__main__":
    main()
