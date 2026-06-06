# Finlytics Backend

FastAPI backend for the Finlytics personal finance platform.

## Stack

- FastAPI (Python 3.11)
- PostgreSQL 15 + SQLAlchemy ORM
- JWT auth with Argon2id password hashing
- OpenRouter AI integration (default: Google Gemini 2.0 Flash)

## Setup

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # set DATABASE_URL and OPENROUTER_API_KEY
uvicorn app.main:app --reload --port 8000
```

Swagger UI at `http://127.0.0.1:8000/docs`.

## Key Endpoints

| Route | Description |
|---|---|
| `POST /api/auth/register` | Create account |
| `POST /api/auth/login` | Get JWT token |
| `GET /api/auth/me` | Current user |
| `GET/POST /api/expenses` | List / create expenses |
| `PUT/DELETE /api/expenses/{id}` | Update / delete expense |
| `GET/POST /api/budgets` | Budget CRUD |
| `GET/POST /api/goals` | Goal CRUD |
| `GET/POST /api/ai/chat` | AI assistant chat |
| `GET /api/dashboard/summary` | Financial summary |
| `GET /api/dashboard/monthly` | Monthly breakdown |
| `GET /api/dashboard/trends` | Trend data |
| `GET /api/dashboard/insights` | AI-generated insights |

## Tests

```bash
python -m pytest           # run all tests
python -m pytest --cov=app # with coverage
```
