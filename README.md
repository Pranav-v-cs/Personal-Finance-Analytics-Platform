# Finlytics

A personal finance analytics platform that helps you track spending, set budgets, and get AI-powered insights about your money.

## What it does

Finlytics connects to your financial data and gives you a clear picture of where your money's going. You can track expenses, set budgets, monitor goals, and ask an AI assistant questions about your finances — all in one place.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + framer-motion
- **Backend**: FastAPI (Python 3.11) with PostgreSQL + SQLAlchemy
- **AI**: OpenRouter (defaults to Google Gemini 2.0 Flash — free tier)
- **Authentication**: JWT tokens with refresh

## Quick Start

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # add your OpenRouter API key here
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

### Database

```bash
createdb finance_db
# update DATABASE_URL in backend/.env with your credentials
```

### Run it

```bash
# terminal 1 — backend
cd backend && uvicorn app.main:app --reload --port 8000

# terminal 2 — frontend
cd frontend && npm run dev
```

## Project Structure

```
backend/
  app/
    main.py              # FastAPI entrypoint
    core/config.py       # Settings via pydantic-settings
    routers/             # auth, expenses, budgets, goals, ai, dashboard
    services/            # Business logic + AI service
    db/                  # Models and session management
  tests/                 # 200+ tests, 99% coverage
frontend/
  src/
    pages/               # Route-level page components
    components/          # UI and dashboard widgets
    hooks/               # Custom React hooks
    services/            # API clients (including AI)
    config/              # Widget definitions and presets
    layouts/             # App shell with sidebar + mobile nav
    utils/               # Formatting helpers
```

## Features

- **Dashboard** — drag-and-drop widgets, customizable layout, preset configurations
- **Expense tracking** — categorize and filter transactions
- **Budgets** — set limits per category and track progress
- **Goals** — save toward financial targets
- **AI Assistant** — ask questions about your finances in natural language
- **Analytics** — trend charts, category breakdowns, anomaly detection
- **Responsive** — works on desktop, tablet, and mobile

## Tests

```bash
# backend
cd backend && python -m pytest

# frontend
cd frontend && npm test
```

## License

MIT — do what you want with it.
