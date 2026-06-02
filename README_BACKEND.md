# Backend README

## Overview

This backend powers a personal finance expense tracking MVP built with:

- FastAPI
- SQLite
- SQLAlchemy ORM
- Pydantic schemas
- JWT authentication

It supports user registration, login, authenticated expense management, dashboard analytics, and default category lookup.

## Folder Structure

```text
backend/
├── app/
│   ├── core/
│   ├── database/
│   ├── routers/
│   ├── schemas/
│   ├── services/
│   └── main.py
├── expense_tracker.db
└── requirements.txt
```

### Key Modules

- `app/core/`: JWT, password hashing, and configuration
- `app/database/`: SQLAlchemy engine, session, and ORM models
- `app/routers/`: FastAPI route handlers
- `app/schemas/`: Pydantic request/response models
- `app/services/`: business logic and database operations

## Setup Instructions

1. Create and activate a virtual environment inside `backend/`.
2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Ensure `backend/.env` exists with:

```env
SECRET_KEY=change-me-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

4. Run the API:

```bash
uvicorn app.main:app --reload
```

5. Open Swagger UI:

```text
http://127.0.0.1:8000/docs
```

## Authentication Flow

1. `POST /auth/register` creates a user with a hashed password.
2. `POST /auth/login` validates credentials and returns a JWT access token.
3. Protected routes require:

```http
Authorization: Bearer <token>
```

4. `GET /auth/me` returns the authenticated user.

## API Endpoints

### Authentication

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me` *(protected)*

### Expenses

- `POST /expenses` *(protected)*
- `GET /expenses` *(protected, supports filters)*
- `GET /expenses/{expense_id}` *(protected)*
- `PUT /expenses/{expense_id}` *(protected)*
- `DELETE /expenses/{expense_id}` *(protected)*

### Dashboard

- `GET /dashboard/summary` *(protected)*
- `GET /dashboard/monthly` *(protected)*

### Categories

- `GET /categories`

## Expense Filtering

`GET /expenses` supports these optional query parameters:

- `category`
- `start_date`
- `end_date`
- `min_amount`
- `max_amount`

Filtering only applies to the authenticated user’s own expenses.

## Future Improvements

- Add automated tests for auth, CRUD, filtering, and analytics
- Add pagination for large expense lists
- Add category persistence if user-defined categories are needed
- Add Alembic migrations when schema changes need versioning
- Add audit logging and rate limiting for production hardening
