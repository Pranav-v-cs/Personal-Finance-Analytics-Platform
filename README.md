# Personal Finance Analytics Platform

A full-stack web application for proactive personal finance management, featuring secure authentication, expense tracking, budget planning, interactive financial analytics, and AI-powered optimization of spending habits.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Directory Structure](#directory-structure)
- [Architecture Overview](#architecture-overview)
- [Environment Setup](#environment-setup)
- [Running the Application](#running-the-application)
- [Usage](#usage)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)

## Features
- 🔐 Secure JWT-based authentication with hashed password storage
- 📊 Interactive expense tracking and categorization
- 💰 Budget creation with real-time limit monitoring
- 📈 Dashboard visualisations with spending trends and patterns
- 🤖 AI-powered financial insights and optimization recommendations
- 🗂️ Multi-account support for multiple users/budgets
- 📅 Date-range based financial reporting
- 📱 Responsive design for desktop and mobile browsers

## Tech Stack
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: FastAPI (Python 3.11) + PostgreSQL
- **Database**: PostgreSQL 15 with SQLAlchemy ORM
- **Authentication**: JWT tokens with refresh mechanism
- **Deployment**: Docker Compose for container management

## Directory Structure
```
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py          # FastAPI application entrypoint
│   │   ├── routers/
│   │   │   ├── auth.py      # Authentication endpoints
│   │   │   ├── expenses.py  # Expense management endpoints
│   │   │   ├── budgets.py   # Budget creation and tracking endpoints
│   │   └── db/
│   │       ├── models.py    # SQLAlchemy model definitions
│   │       └── session.py   # Database session management
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── __init__.py
│   │   ├── App.jsx          # Main React component
│   │   ├── main.jsx         # React entry point
│   │   └── components/
│   │       └── ...          # UI components
│   └── config/
│       └── environment.ts
├── frontend/
│   └── package.json
├── requirements.txt         # Backend Python dependencies
├── tailwind.config.js
└── README.md                # Project documentation
```

## Architecture Overview
The application follows a clean **RESTful API** pattern with orthogonal concerns clearly separated:

1. **Frontend Layer**  
   - React SPA communicating with backend via Axios instance with JWT interceptors
   - Component hierarchy optimized for state separation (container vs presentational components)
   - Tailwind-based responsive design system with theme support

2. **Backend Layer**  
   - Multiple FastAPI routers providing focused endpoint endpoints
   - Dependency-injected business logic services
   - Centralized error handling with custom middleware
   - Comprehensive input validation using Pydantic models

3. **Data Layer**  
   - SQLAlchemy ORM mapping to PostgreSQL tables
   - Transaction management with context-based session handling
   - Indexing strategy for performance-critical queries

## Environment Setup
### Prerequisites
- Python 3.11+ (pyenv recommended)
- Node 18+ (nvm recommended)
- PostgreSQL 15+
- Git client

### Installation Steps
1. **Backend Setup**
   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   cp .env.example .env
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   cp .env.example .env.local
   ```

3. **Database Configuration**
   - Create PostgreSQL database: `CREATE DATABASE finance_db;`
   - Update `.env` with database credentials

## Running the Application
### Development Mode
```bash
# Run backend server
cd backend
uvicorn app.main:app --reload --port 8000

# Run frontend development server
cd ../frontend
npm run dev
```

### Production Mode (Docker)
```bash
docker-compose up --build
```

## Usage
1. **Authentication**
   - POST `/api/auth/register` - Create new account
   - POST `/api/auth/login` - Authenticate and receive JWT token

2. **Expense Tracking**
   - GET `/api/expenses` - List all expenses
   - POST `/api/expenses` - Create new expense record
   - PUT `/api/expenses/{id}` - Update existing expense

3. **Budget Management**
   - `/api/budgets` - Create new budget
   - `/api/budgets/{category}` - Update budget limits

4. **Dashboard**
   - `/api/dashboard/summary` - Get financial summary statistics
   - `/api/dashboard/trends` - Retrieve analytics visualizations

## Security
- HTTPS enforced via production configuration
- JWT tokens with 15-minute expiration and refresh token mechanism
- Passwords hashed using Argon2id algorithm
- Input validation and sanitization for all API requests

## Contributing
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes with descriptive messages
4. Submit pull request with detailed description

## License
[MIT License](https://choosealicense.com/licenses/mit/) - © 2023 Personal Finance Analytics Platform Contributors

---

*Project maintained by Pranav. Documented with ❤️ using Markdown.*