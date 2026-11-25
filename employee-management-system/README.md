# Mini Employee Management System

Full-stack employee management app with JWT authentication, CRUD, search, filters and server-side pagination.

<<<<<<< HEAD
## What's new: sidebar layout
- Collapsible left sidebar (grouped menu: Dashboard, Employees, Students, Salary Details), mobile drawer, dark mode toggle
- New Dashboard page (`/`) with stats, department chart, status donut, 6-month payroll trend and recent joiners
- New API: `GET /dashboard/summary`
- Employee list moved to `/employees`; students at `/students`

=======
>>>>>>> 2ab088867014c71a7eb167d4554fb79a90cdfac9
## Technology Stack
- **Frontend:** React 18 (Vite), React Router, Axios, plain responsive CSS
- **Backend:** FastAPI (Python 3.12), SQLAlchemy 2, Pydantic v2, PyJWT, bcrypt
- **Database:** PostgreSQL (SQLAlchemy 2 + psycopg2)
- **Testing:** pytest (runs on SQLite by default, or on PostgreSQL via `TEST_DATABASE_URL`)

## Features
- Login / logout with JWT; protected routes on the frontend and protected APIs on the backend
- Dashboard stats (total / active / inactive) fetched from the API
- Employee list with View / Edit / Delete, delete confirmation dialog
- Add / Edit forms with frontend **and** backend validation (name, email, phone, joining date, status)
- Search by name/email, filter by department and status (all combinable), server-side pagination
- Consistent error handling: 400, 401, 404, 409, 422, 500 with safe messages (no stack traces leaked)
- Responsive UI (table turns into cards on mobile), reusable components

## Project Structure
```
backend/
  app/
    main.py            App setup, CORS, error handlers, admin seeding
    config.py          Env-based settings
    database.py        Engine, session, Base
    models.py          SQLAlchemy tables: users, employees
    security.py        Password hashing + JWT
    deps.py            get_current_user dependency
    schemas.py         Pydantic models + validation rules
    routers/auth.py        POST /auth/login, GET /auth/me
    routers/employees.py   Employee CRUD, stats, departments
  tests/test_api.py
  seed.py              Optional: 25 sample employees
  requirements.txt  .env.example  Dockerfile
frontend/
  src/api/           Axios client + service layer
  src/components/    Button, FormField, Modal, ConfirmDialog, Pagination, StatusBadge, Navbar, EmployeeTable...
  src/context/       AuthContext
  src/pages/         Login, Dashboard, EmployeeForm (add/edit), EmployeeView
  src/utils/         Validators
```

## Setup (local)
Prerequisites: Python 3.10+, Node 18+, PostgreSQL 13+ running locally (or a hosted Postgres URL).

**Backend**
```bash
cd backend
python -m venv venv && source venv\bin\activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                                  # then fill in DATABASE_URL, JWT_SECRET, ADMIN_PASSWORD
python seed.py                                        # optional sample data
uvicorn app.main:app --reload                         # http://localhost:8000  (Swagger: /docs)
```
**Frontend**
```bash
cd frontend
npm install
cp .env.example .env                                  # VITE_API_BASE_URL=http://localhost:8000
npm run dev                                           # http://localhost:5173
```
Log in with the `ADMIN_EMAIL` / `ADMIN_PASSWORD` you set in `backend/.env` (the admin is created automatically on first start).

**Tests:** `cd backend && pytest`

## Environment Variables
| File | Variable | Purpose |
|---|---|---|
| backend/.env | `DATABASE_URL` | `postgresql+psycopg2://USER:PASSWORD@HOST:5432/DBNAME` |
| | `JWT_SECRET` | JWT signing key (long random string) |
| | `JWT_ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES` | Token settings |
| | `CORS_ORIGINS` | Comma-separated allowed frontend URLs |
| | `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Seed admin user |
| frontend/.env | `VITE_API_BASE_URL` | Backend base URL |

## Database Setup
1. Create the database once (tables are created automatically on startup):
   ```sql
   CREATE DATABASE employee_management;
   ```
2. Put the connection string in `backend/.env` (URL-encode special characters in the password: `@` -> `%40`).
3. Start the API: it runs `create_all` (creates missing tables only) and creates the admin user.

Tables: `users` (email unique, password_hash) and `employees` (email unique, status CHECK in Active/Inactive, indexes on name, department, status).
If you have old tables with different columns, drop them first: `DROP TABLE IF EXISTS employees, users CASCADE;`

## API Documentation
All `/employees*` routes need header `Authorization: Bearer <token>`. Interactive docs: `/docs`.

| Method | Endpoint | Description | Success |
|---|---|---|---|
| POST | `/auth/login` | Body `{email, password}` → `{access_token, token_type, user}` | 200 |
| GET | `/auth/me` | Current user | 200 |
| GET | `/employees` | Query: `page`, `limit` (1-100), `search`, `department`, `status` → `{items,total,page,limit,pages}` | 200 |
| GET | `/employees/stats` | `{total, active, inactive}` | 200 |
| GET | `/employees/departments` | List of distinct departments | 200 |
| GET | `/employees/{id}` | One employee | 200 |
| POST | `/employees` | Create (body below) | 201 |
| PUT | `/employees/{id}` | Full update | 200 |
| DELETE | `/employees/{id}` | Delete | 200 |

Body: `{"name","email","phone","department","designation","joining_date":"YYYY-MM-DD","status":"Active|Inactive"}`

Validation rules: name 2-100 chars; valid email (stored lowercase); phone 10-15 digits with optional `+`; joining date between 1990-01-01 and one year ahead; status only `Active`/`Inactive`.

Routes are also served under an `/api` prefix (e.g. `/api/auth/login`).

Errors: `400` invalid ID · `401` bad credentials / missing or expired token · `404` not found · `409` duplicate email · `422` validation `{detail, errors:[{field,message}]}` · `500` generic message.

## Deployment
Suggested free setup:
- **Database:** Render PostgreSQL, Neon or Supabase (free tiers). Use the provided URL as `DATABASE_URL` (add `?sslmode=require` if the host needs SSL).
- **Backend:** Render / Railway (Web Service, root `backend`). Build: `pip install -r requirements.txt`. Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`. Set all backend env vars; set `CORS_ORIGINS` to the frontend URL (no trailing slash).
- **Frontend:** Vercel / Netlify (root `frontend`, build `npm run build`, output `dist`). Set `VITE_API_BASE_URL` to the backend URL. SPA rewrite files (`vercel.json`, `public/_redirects`) are included.

Live URLs: Frontend: _add here_ · Backend: _add here_ · Repo: _add here_

## Known Limitations
- Single role (admin); no registration or password reset.
- Token is stored in localStorage (simple approach; httpOnly cookies would be stronger).

## Libraries Used
FastAPI, Uvicorn, PyPostgres, Pydantic, PyJWT, bcrypt, React, React Router, Axios, Vite.
<<<<<<< HEAD


## Student Information module

The project includes a Student Information section alongside Employee Management. After starting the app and signing in, use **Students** in the top navigation to add, search, view, edit, or delete student records.

Student fields: student name, email, phone, gender, date of birth, department, course, year of study, address, and admission date. Student API routes are protected by the same login token as the employee routes (`/students`). The backend creates the `students` table on startup through SQLAlchemy `create_all`.

### Run the frontend after extracting the project

```bash
cd frontend
npm install
npm run dev
```

Start the backend using the existing backend setup documented above. Make sure `VITE_API_BASE_URL` in `frontend/.env` points to the running backend URL. Do not commit your real `.env` credentials.

## Salary Details

Use **Salary Details** in the top navigation (or the **Salary** link on any employee row) to add monthly salary records.

Fields: employee, month (YYYY-MM), basic salary, HRA, allowances, deductions. **Net salary = basic + HRA + allowances - deductions** and is always calculated on the server. Each employee can have one record per month. Deleting an employee also deletes their salary records. The `salary_details` table is created on startup by `create_all` (no manual migration needed).

| Method | Endpoint | Description | Success |
|---|---|---|---|
| GET | `/salaries?employee_id=&month=YYYY-MM` | List salary records | 200 |
| POST | `/salaries` | Insert a salary record | 201 |
| GET | `/salaries/{id}` | Get one record | 200 |
| PUT | `/salaries/{id}` | Update a record | 200 |
| DELETE | `/salaries/{id}` | Delete a record | 200 |
=======
>>>>>>> 2ab088867014c71a7eb167d4554fb79a90cdfac9
