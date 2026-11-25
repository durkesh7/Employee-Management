import os

# Tests run against a throw-away SQLite file, so no PostgreSQL server is needed.
# Set TEST_DATABASE_URL to a PostgreSQL URL to run them against Postgres instead.
os.environ.update(
    DATABASE_URL=os.environ.get("TEST_DATABASE_URL", "sqlite:///./test_ems.db"),
    JWT_SECRET="test-secret-key-for-unit-tests-only-1234567890",
    ADMIN_EMAIL="admin@test.com",
    ADMIN_PASSWORD="Admin@12345",
)

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.database import Base, engine  # noqa: E402
from app.main import app  # noqa: E402

VALID = {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+919876543210",
    "department": "IT",
    "designation": "Developer",
    "joining_date": "2024-01-15",
    "status": "Active",
}


@pytest.fixture(scope="module")
def client():
    Base.metadata.drop_all(bind=engine)
    with TestClient(app) as c:
        yield c
    Base.metadata.drop_all(bind=engine)
    engine.dispose()
    if str(engine.url).startswith("sqlite") and os.path.exists("test_ems.db"):
        os.remove("test_ems.db")


@pytest.fixture(scope="module")
def headers(client):
    r = client.post("/auth/login", json={"email": "admin@test.com", "password": "Admin@12345"})
    assert r.status_code == 200
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


def test_login_invalid(client):
    assert client.post("/auth/login", json={"email": "admin@test.com", "password": "wrong"}).status_code == 401


def test_login_validation(client):
    assert client.post("/auth/login", json={"email": "bad", "password": "x"}).status_code == 422


def test_unauthorized(client):
    assert client.get("/employees").status_code == 401


def test_api_prefix_also_works(client):
    r = client.post("/api/auth/login", json={"email": "admin@test.com", "password": "Admin@12345"})
    assert r.status_code == 200


def test_crud_flow(client, headers):
    r = client.post("/employees", json=VALID, headers=headers)
    assert r.status_code == 201
    emp_id = r.json()["id"]

    assert client.post("/employees", json=VALID, headers=headers).status_code == 409
    assert client.get(f"/employees/{emp_id}", headers=headers).json()["email"] == "john@example.com"

    other = client.post("/employees", json={**VALID, "email": "jane@example.com", "name": "Jane"}, headers=headers)
    assert other.status_code == 201
    dup = client.put(f"/employees/{emp_id}", json={**VALID, "email": "jane@example.com"}, headers=headers)
    assert dup.status_code == 409

    r = client.put(f"/employees/{emp_id}", json={**VALID, "status": "Inactive"}, headers=headers)
    assert r.status_code == 200 and r.json()["status"] == "Inactive"

    assert client.get("/employees/stats", headers=headers).json() == {"total": 2, "active": 1, "inactive": 1}

    r = client.get("/employees?search=JOHN&status=Inactive&department=IT&page=1&limit=5", headers=headers)
    assert r.json()["total"] == 1
    assert client.get("/employees?search=100%25", headers=headers).json()["total"] == 0  # wildcard is literal
    assert client.get("/employees/departments", headers=headers).json() == ["IT"]

    assert client.delete(f"/employees/{emp_id}", headers=headers).status_code == 200
    assert client.get(f"/employees/{emp_id}", headers=headers).status_code == 404
    assert client.delete(f"/employees/{emp_id}", headers=headers).status_code == 404


def test_pagination(client, headers):
    for i in range(12):
        client.post("/employees", json={**VALID, "email": f"p{i}@example.com"}, headers=headers)
    page1 = client.get("/employees?page=1&limit=5", headers=headers).json()
    page3 = client.get("/employees?page=3&limit=5", headers=headers).json()
    assert len(page1["items"]) == 5 and page1["pages"] == 3 and page1["total"] == 13
    assert len(page3["items"]) == 3


def test_validation_and_ids(client, headers):
    bad = {**VALID, "name": " ", "email": "nope", "phone": "123", "status": "Maybe"}
    r = client.post("/employees", json=bad, headers=headers)
    assert r.status_code == 422
    assert {e["field"] for e in r.json()["errors"]} >= {"name", "email", "phone", "status"}
    assert client.get("/employees/abc", headers=headers).status_code == 400
    assert client.get("/employees/99999999999", headers=headers).status_code == 400
    assert client.get("/employees?limit=0", headers=headers).status_code == 422


def test_salary_flow(client, headers):
    emp = client.post("/employees", json={**VALID, "email": "pay@example.com"}, headers=headers).json()
    body = {
        "employee_id": emp["id"], "salary_month": "2026-11",
        "basic_salary": "30000", "hra": "6000", "allowances": "2000.50", "deductions": "1500",
    }

    r = client.post("/salaries", json=body, headers=headers)
    assert r.status_code == 201
    salary = r.json()
    assert salary["net_salary"] == 36500.50          # 30000 + 6000 + 2000.50 - 1500
    assert salary["employee_name"] == "John Doe"

    # one record per employee per month
    assert client.post("/salaries", json=body, headers=headers).status_code == 409
    # unknown employee
    assert client.post("/salaries", json={**body, "employee_id": 999999}, headers=headers).status_code == 404

    # validation
    bad = client.post("/salaries", json={**body, "salary_month": "2026-13", "basic_salary": "0"}, headers=headers)
    assert bad.status_code == 422
    assert {e["field"] for e in bad.json()["errors"]} >= {"salary_month", "basic_salary"}
    too_much = client.post("/salaries", json={**body, "salary_month": "2026-12", "deductions": "999999"}, headers=headers)
    assert too_much.status_code == 422

    # list / filter / update
    assert len(client.get(f"/salaries?employee_id={emp['id']}", headers=headers).json()) == 1
    assert client.get("/salaries?month=2020-01", headers=headers).json() == []
    r = client.put(f"/salaries/{salary['id']}", json={**body, "basic_salary": "40000"}, headers=headers)
    assert r.status_code == 200 and r.json()["net_salary"] == 46500.50

    # deleting the employee removes the salary rows too
    assert client.delete(f"/employees/{emp['id']}", headers=headers).status_code == 200
    assert client.get(f"/salaries/{salary['id']}", headers=headers).status_code == 404


def test_salary_requires_login(client):
    assert client.get("/salaries").status_code == 401
