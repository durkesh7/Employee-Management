import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError

from .config import settings
from .database import Base, SessionLocal, engine
<<<<<<< HEAD
from .models import User, Student
from .routers import auth, dashboard, employees, salaries, students
=======
from .models import User
from .routers import auth, employees
>>>>>>> 2ab088867014c71a7eb167d4554fb79a90cdfac9
from .security import hash_password

logger = logging.getLogger("employee-api")


def seed_admin() -> None:
    """Create the admin user from ADMIN_EMAIL / ADMIN_PASSWORD if it does not exist yet."""
    email = settings.admin_email.lower()
    with SessionLocal() as db:
        if not db.scalar(select(User).where(User.email == email)):
            db.add(User(email=email, name="Admin", password_hash=hash_password(settings.admin_password)))
            db.commit()


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)  # creates missing tables only
    seed_admin()
    yield


app = FastAPI(title="Mini Employee Management API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_error_handler(_: Request, exc: RequestValidationError):
    errors = [
        {
            "field": ".".join(str(p) for p in e["loc"][1:]) or str(e["loc"][0]),
            "message": e["msg"].removeprefix("Value error, "),
        }
        for e in exc.errors()
    ]
    return JSONResponse(status_code=422, content={"detail": "Validation failed", "errors": errors})


@app.exception_handler(SQLAlchemyError)
async def database_error_handler(_: Request, exc: SQLAlchemyError):
    logger.exception("Database error: %s", exc)
    return JSONResponse(status_code=500, content={"detail": "A database error occurred. Please try again later."})


@app.exception_handler(Exception)
async def unhandled_error_handler(_: Request, exc: Exception):
    logger.exception("Unhandled error: %s", exc)
    return JSONResponse(status_code=500, content={"detail": "Something went wrong. Please try again later."})


app.include_router(auth.router)
app.include_router(employees.router)
<<<<<<< HEAD
app.include_router(students.router)
app.include_router(salaries.router)
app.include_router(dashboard.router)
# The same routes are also served under /api/..., so a frontend using either style works.
app.include_router(auth.router, prefix="/api", include_in_schema=False)
app.include_router(employees.router, prefix="/api", include_in_schema=False)
app.include_router(students.router, prefix="/api", include_in_schema=False)
app.include_router(salaries.router, prefix="/api", include_in_schema=False)
app.include_router(dashboard.router, prefix="/api", include_in_schema=False)
=======
# The same routes are also served under /api/..., so a frontend using either style works.
app.include_router(auth.router, prefix="/api", include_in_schema=False)
app.include_router(employees.router, prefix="/api", include_in_schema=False)
>>>>>>> 2ab088867014c71a7eb167d4554fb79a90cdfac9


@app.get("/", tags=["Health"])
def health():
    return {"status": "ok"}
